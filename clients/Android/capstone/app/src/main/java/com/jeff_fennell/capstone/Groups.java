package com.jeff_fennell.capstone;

import android.app.Activity;
import android.app.DialogFragment;
import android.app.Fragment;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.graphics.drawable.RoundedBitmapDrawable;
import android.support.v4.graphics.drawable.RoundedBitmapDrawableFactory;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Adapter;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import com.bumptech.glide.Glide;
import com.bumptech.glide.request.target.BitmapImageViewTarget;
import com.jeff_fennell.capstone.entities.Group;
import com.jeff_fennell.capstone.entities.Image;
import java.io.IOException;
import java.util.List;
import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class Groups extends Activity implements CreateGroupFragment.CreateGroupListener{
    private BubblService api;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_groups);

        Retrofit retrofit = new Retrofit.Builder()
                .addConverterFactory(GsonConverterFactory.create())
                .baseUrl(BuildConfig.API_BASE_URL)
                .build();
        api = retrofit.create(BubblService.class);
        getAndPopulateGroups();
    }

    private void getAndPopulateGroups() {
        new GetGroupsWithImages(this).execute();
    }

    class GetGroupsWithImages extends AsyncTask<Void, Void, List<Group>>{
        Activity activity;

        public GetGroupsWithImages(Activity activity) {
            this.activity = activity;
        }

        @Override
        protected List<Group> doInBackground(Void... params) {
            Call<List<Group>> getGroups = api.getGroups(UserProfile.getAuthenticationToken(activity));
            List<Group> groups = null;
            try {
                groups = getGroups.execute().body();
                for (Group group : groups) {
                    Call getGroupImage = api.getImages(
                        Image.GROUP_PROFILE,
                        group.getGroupId(),
                        UserProfile.getAuthenticationToken(activity)
                    );
                    List<Image> imageList = (List<Image>)getGroupImage.execute().body();
                    String groupProfileImageUrl = null;
                    if (imageList.size() > 0) {
                        groupProfileImageUrl = imageList.get(0).getUrl();
                    }

                    group.setGroupImageUrl(groupProfileImageUrl);
                }
            } catch (IOException e) {
                System.out.print("hi");
                //display error message
            }
            return groups;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            //start spinner
        }

        @Override
        protected void onPostExecute(List<Group> groups) {
            super.onPostExecute(groups);
            //stop spinner
            GridView groupGrid = (GridView)findViewById(R.id.group_list);
            GroupsAdapter adapter = new GroupsAdapter(groups, activity);
            groupGrid.setAdapter(adapter);
            groupGrid.setOnItemClickListener(new GroupClickListener(activity));

        }
    }

    public class GroupsAdapter extends ArrayAdapter<Group> {

        public GroupsAdapter(List<Group> groups, Activity activity) {
            super(activity,R.layout.group_view, groups);
        }

        public int getCount() {
            return super.getCount();
        }

        public Group getItem(int position) {
            return super.getItem(position);
        }

        public long getItemId(int position) {
            return super.getItem(position).getGroupId();
        }

        public View getView(int position, View convertView, ViewGroup parent) {
            Group group = getItem(position);
            LinearLayout groupView;
            if (convertView == null) {
                groupView = (LinearLayout)getLayoutInflater().inflate(R.layout.group_view, parent, false);

                final ImageView groupImage = (ImageView)groupView.findViewById(R.id.group_image);
                TextView groupName = (TextView)groupView.findViewById(R.id.group_name);
                groupName.setText(group.getName());

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
                else {
                    groupImage.setImageDrawable(getDrawable(R.drawable.ic_people_white_48dp));
                }
            } else {
                groupView = (LinearLayout)convertView;
                ((TextView)convertView.findViewById(R.id.group_name)).setText(group.getName());
                final ImageView groupImage = (ImageView)groupView.findViewById(R.id.group_image);
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
            return groupView;
        }
    }

    public class GroupClickListener implements AdapterView.OnItemClickListener {
        private Activity activity;

        public GroupClickListener(Activity activity) {
            this.activity = activity;
        }

        @Override
        public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
            Group selectedGroup = (Group)parent.getItemAtPosition(position);
            Intent groupDetailView = new Intent(activity,GroupDetailView.class);
            Bundle groupPayload = new Bundle();
            groupPayload.putSerializable(Group.serializeKey, selectedGroup);
            groupDetailView.putExtras(groupPayload);
            startActivity(groupDetailView);
        }
    }

    public void launchCreateGroupDialog(View view) {
        DialogFragment newFragment = new CreateGroupFragment();
        newFragment.show(getFragmentManager(), CreateGroupFragment.FRAGMENT_TAG);
    }

    @Override
    public void updateGroupList(Group group) {
        Fragment createGroup = getFragmentManager().findFragmentByTag(CreateGroupFragment.FRAGMENT_TAG);
        ((DialogFragment)createGroup).dismiss();
        GridView groupList = (GridView)findViewById(R.id.group_list);
        GroupsAdapter groupAdapter = (GroupsAdapter)groupList.getAdapter();
        groupAdapter.add(group);
        groupAdapter.notifyDataSetChanged();
    }
}