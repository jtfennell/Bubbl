package com.jeff_fennell.capstone;

import android.app.Fragment;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.os.Bundle;
import android.app.Activity;
import android.support.v4.graphics.drawable.RoundedBitmapDrawable;
import android.support.v4.graphics.drawable.RoundedBitmapDrawableFactory;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.target.BitmapImageViewTarget;
import com.jeff_fennell.capstone.entities.Group;
import com.jeff_fennell.capstone.entities.Image;
import com.jeff_fennell.capstone.entities.User;
import org.apache.commons.lang3.StringUtils;
import java.io.IOException;
import java.util.List;

import it.sephiroth.android.library.widget.HListView;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class  GroupDetailView extends Activity implements InviteMemberDialog.InviteMemberListener {
    private Group group;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_group_detail_view);
        Group groupToDisplay = (Group)getIntent().getExtras().get(Group.serializeKey);
        getActionBar().setTitle(groupToDisplay.getName());
        this.group = groupToDisplay;
        hideInviteButtonIfNotAdmin();
        displayMembers(groupToDisplay);
    }

    private void displayMembers(Group group) {
        TextView groupEmptyMessage = (TextView)findViewById(R.id.group_empty_message);

        if (group.getMembers() != null && group.getMembers().size() >= 1) {
            groupEmptyMessage.setVisibility(View.GONE);
        } else {
            groupEmptyMessage.setVisibility(View.VISIBLE);
        }
        HListView memberList = (HListView)findViewById(R.id.members_in_group);
        memberList.setAdapter(new MemberAdapter(group.getMembers(), this));
    }

    public class MemberAdapter extends ArrayAdapter<User>{
        private Activity activity;
        public MemberAdapter(List<User> members, Activity activity) {
            super(activity, R.layout.member_view, members);
            this.activity = activity;
        }

        @Override
        public View getView(int position, View recycledView, ViewGroup parent) {
            final User user = getItem(position);
            View memberView = null;

            if (recycledView == null) {
                memberView = LinearLayout.inflate(activity, R.layout.member_view, null);
            } else {
                memberView = recycledView;
            }

            TextView memberName = (TextView)memberView.findViewById(R.id.member_name);
            memberName.setText(StringUtils.join(user.getFirstName() + " " + user.getLastName()));
            final ImageView userImage = (ImageView)memberView.findViewById(R.id.member_profile_image);
            new GetMemberImageTask(activity, user.getUserId(), userImage).execute();

            return memberView;
        }
    }

    public void openInviteDialog(View view) {
        getFragmentManager()
            .beginTransaction()
            .add(new InviteMemberDialog(), InviteMemberDialog.FRAGMENT_TAG)
            .commit();
    }

    public class GetMemberImageTask extends AsyncTask<Void, Void, Image> {
        private Activity activity;
        private ImageView profileImageView;
        private long userId;

        public GetMemberImageTask(Activity activity, long userId, ImageView profileImageView) {
            this.activity = activity;
            this.profileImageView = profileImageView;
            this.userId = userId;
       }

        @Override
        protected Image doInBackground(Void... params) {
            Call getUserProfileImage = Utils.getClient().getProfileImage(
                    Image.USER_PROFILE,
                    userId,
                    UserProfile.getAuthenticationToken(activity)
            );
            Image image = null;

            try {
                Response response = getUserProfileImage.execute();
                if (response.isSuccessful()) {
                    image = ((List<Image>)response.body()).get(0);
                }

            } catch (IOException e) {
                System.out.println("here");
            }
            return image;
        }

        @Override
        protected void onPostExecute(Image image) {
            super.onPostExecute(image);
            if (image == null || image.getUrl() == null) {
                profileImageView.setImageDrawable(getDrawable(R.drawable.ic_people_white_24dp));
            } else {
                Glide
                    .with(activity)
                    .load(image.getUrl())
                    .asBitmap()
                    .placeholder(R.drawable.ic_people_white_48dp)
                    .centerCrop()
                    .into(new BitmapImageViewTarget(profileImageView) {
                        @Override
                        protected void setResource(Bitmap resource) {
                            RoundedBitmapDrawable circularBitmapDrawable =
                                    RoundedBitmapDrawableFactory.create(activity.getResources(), resource);
                            circularBitmapDrawable.setCircular(true);
                            profileImageView.setImageDrawable(circularBitmapDrawable);
                        }
                    });
            }
        }
    }

    @Override
    public void inviteMember(String username) {
        Call inviteMember = Utils
                .getClient()
                .inviteMemberToGroup(
                        username,group.getGroupId(),
                        UserProfile.getAuthenticationToken(this)
                );
        inviteMember.enqueue(new Callback() {
            @Override
            public void onResponse(Call call, Response response) {
                if (response.isSuccessful()) {
                    toastSuccessMessage();
                    dismissInviteFragment();
                } else if (response.code() == 404){
                    toastMemberNotFoundMessage();
                }
            }

            @Override
            public void onFailure(Call call, Throwable t) {
                toastErrorMessage();
            }
        });
    }

    private void toastSuccessMessage() {
        Utils.toast(
                getApplicationContext(),
                R.string.invite_user_success,
                Toast.LENGTH_LONG
        );
    }

    private void toastMemberNotFoundMessage() {
        Utils.toast(
            getApplicationContext(),
            R.string.user_not_found,
            Toast.LENGTH_LONG
        );
    }

    private void dismissInviteFragment() {
        Fragment  inviteFragment = getFragmentManager()
            .findFragmentByTag(
                InviteMemberDialog.FRAGMENT_TAG
            );
        getFragmentManager()
            .beginTransaction()
            .remove(inviteFragment)
            .commit();
    }

    private void toastErrorMessage() {
        Utils.toast(
                this,
                R.string.invite_user_failure,
                Toast.LENGTH_LONG
        );
    }

    private void hideInviteButtonIfNotAdmin() {
        if (UserProfile.getUserId(this) != group.getAdmin()) {
            findViewById(R.id.invite_member_button).setVisibility(View.GONE);
        }
    }
}
