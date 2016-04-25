package com.jeff_fennell.capstone;

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
import android.widget.ListView;
import android.widget.TextView;
import com.bumptech.glide.Glide;
import com.bumptech.glide.request.target.BitmapImageViewTarget;
import com.jeff_fennell.capstone.entities.Group;
import com.jeff_fennell.capstone.entities.Image;
import com.jeff_fennell.capstone.entities.User;
import org.apache.commons.lang3.StringUtils;
import java.io.IOException;
import java.util.List;
import retrofit2.Call;
import retrofit2.Response;

public class  GroupDetailView extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_group_detail_view);
        Group groupToDisplay = (Group)getIntent().getExtras().get(Group.serializeKey);
        getActionBar().setTitle(groupToDisplay.getName());
        displayMembers(groupToDisplay);
    }

    private void displayMembers(Group group) {
        TextView groupEmptyMessage = (TextView)findViewById(R.id.group_empty_message);

        if (group.getMembers() != null && group.getMembers().size() >= 1) {
            groupEmptyMessage.setVisibility(View.GONE);
        } else {
            groupEmptyMessage.setVisibility(View.VISIBLE);
        }

        ((ListView)findViewById(R.id.members_in_group)).setAdapter(new MemberAdapter(group.getMembers(), this));
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
}
