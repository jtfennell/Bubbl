package com.jeff_fennell.capstone;

import android.app.Activity;
import android.app.DialogFragment;
import android.graphics.Bitmap;
import android.graphics.Point;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.graphics.drawable.RoundedBitmapDrawable;
import android.support.v4.graphics.drawable.RoundedBitmapDrawableFactory;
import android.view.Display;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import com.bumptech.glide.Glide;
import com.bumptech.glide.request.target.BitmapImageViewTarget;
import com.jeff_fennell.capstone.entities.Album;
import com.jeff_fennell.capstone.entities.Group;
import com.jeff_fennell.capstone.entities.Image;
import com.jeff_fennell.capstone.entities.User;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import retrofit2.Call;

public class SelectGroupDialog extends DialogFragment {
    public static String FRAGMENT_TAG = "selectGroup";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        bindOnClickListener();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View v = inflater.inflate(R.layout.select_group_fragment_dialog, container, false);
        getDialog().setTitle(R.string.group_dialog_title);

        return v;
    }

    @Override
    public void onResume() {
        super.onResume();

        Window window = getDialog().getWindow();
        Point size = new Point();

        Display display = window.getWindowManager().getDefaultDisplay();
        display.getSize(size);

        int width = size.x;
        int height = size.y;

        window.setLayout((int) (width * 0.75), WindowManager.LayoutParams.WRAP_CONTENT);
        window.setLayout((int) (height * .5), WindowManager.LayoutParams.WRAP_CONTENT);
        window.setGravity(Gravity.CENTER);
        System.out.println(this);
        DownloadGroupsAndMembersTask getGroups = new DownloadGroupsAndMembersTask();
        getGroups.execute(null, null, null);
    }

    class GroupsAdapter extends ArrayAdapter{
        public GroupsAdapter(List<Group> groups) {
            super(getActivity(), R.layout.group_list_view, groups);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            Group group = (Group)getItem(position);
            LayoutInflater inflater = getActivity().getLayoutInflater();
            ListView usersGroupList = (ListView) getActivity().findViewById(R.id.users_groups);
            LinearLayout groupView = (LinearLayout)inflater.inflate(R.layout.group_list_view, usersGroupList, false);
            ((TextView)groupView.findViewById(R.id.group_name)).setText(group.getName());
            final ImageView groupImage = (ImageView)groupView.findViewById(R.id.group_image);

            String membersInGroup = "";
            List members =(List<User>)group.getMembers();
            if (members.size() >= 1) {
                for (User member : (List<User>) group.getMembers()) {
                    membersInGroup += member.getFirstName() + ", ";
                }
                membersInGroup = membersInGroup.trim().substring(0, membersInGroup.lastIndexOf(","));
            } else {
                membersInGroup = getString(R.string.no_members);
            }

            if (group.getGroupImageUrl() != null) {
                Glide
                    .with(getContext())
                    .load(group.getGroupImageUrl())
                    .asBitmap()
                    .placeholder(R.drawable.ic_people_white_48dp)
                    .centerCrop()
                    .into(new BitmapImageViewTarget(groupImage) {
                        @Override
                        protected void setResource(Bitmap resource) {
                            RoundedBitmapDrawable circularBitmapDrawable =
                                    RoundedBitmapDrawableFactory.create(getContext().getResources(), resource);
                            circularBitmapDrawable.setCircular(true);
                            groupImage.setImageDrawable(circularBitmapDrawable);
                        }
                    });
            }

            ((TextView)groupView.findViewById(R.id.group_members)).setText(membersInGroup);
            return groupView;
        }

    }

    class DownloadGroupsAndMembersTask extends AsyncTask<Void, Void, List<Group>> {
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            //TODO - start spinner on dialog fragment
        }

        @Override
        protected List<Group> doInBackground(Void... params) {
            List<Group> usersGroups = null;
            Call<List<Group>> getGroups = Utils.getClient().getGroups(UserProfile.getAuthenticationToken(getActivity()));
            try {
                usersGroups = getGroups.execute().body();
                for (Group group : usersGroups) {
//                    Activity activity = getActivity();
                    Call<List<User>> getMembersInGroup = Utils
                            .getClient()
                            .getMembersInGroup(
                                    group.getGroupId(),
                                    UserProfile.getAuthenticationToken(getActivity())
                            );
                    List<User> membersInGroup = getMembersInGroup.execute().body();
                    removeThisUserFromMemberList(membersInGroup);
                    group.setMembers(membersInGroup);

                    Call getGroupImage = Utils.getClient().getImages(
                            Image.GROUP_PROFILE,
                            group.getGroupId(),
                            Album.NO_ALBUM,
                            UserProfile.getAuthenticationToken(getActivity())
                    );

                    List<Image> imageList = (List<Image>)getGroupImage.execute().body();
                    String groupProfileImageUrl = null;
                    if (imageList.size() > 0) {
                        groupProfileImageUrl = imageList.get(0).getUrl();
                    }

                    group.setGroupImageUrl(groupProfileImageUrl);
                }
            } catch (IOException e) {
                System.out.println();
            }
            return usersGroups;
        }

        @Override
        protected void onPostExecute(List<Group> groups) {
            super.onPostExecute(groups);
            GroupsAdapter groupAdapter = new GroupsAdapter(groups);
            ListView usersGroupsList = (ListView)getView().findViewById(R.id.users_groups);
            usersGroupsList.setAdapter(groupAdapter);
            ((CameraActivity)getActivity()).setGroups(groups);
        }

        private void removeThisUserFromMemberList(List<User> membersInGroup) {
            Iterator<User> iter = membersInGroup.iterator();
            while (iter.hasNext()) {
                User user = iter.next();

                if ((user.getUserId() == UserProfile.getUserId(getActivity()))) {
                    iter.remove();
                }
            }
        }
    }

    public interface OnGroupSelectedListener {
        void handleGroupSelected(Group group);
    }

    private void bindOnClickListener() {
        AdapterView.OnItemClickListener listener = new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                ((SelectGroupDialog.OnGroupSelectedListener) getActivity()).handleGroupSelected((Group) parent.getItemAtPosition(position));
            }
        };

        ((ListView)getView().findViewById(R.id.users_groups)).setOnItemClickListener(listener);
    }
}