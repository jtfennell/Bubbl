package com.jeff_fennell.capstone;

import android.app.DialogFragment;
import android.graphics.Point;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.Display;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import com.jeff_fennell.capstone.entities.Group;
import com.jeff_fennell.capstone.entities.User;
import java.io.IOException;
import java.util.List;
import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class SelectGroupDialog extends DialogFragment {
    private List<Group> groupsWithMembers;
    public static String FRAGMENT_TAG = "selectGroup";

    Retrofit retrofit = new Retrofit.Builder()
            .addConverterFactory(GsonConverterFactory.create())
            .baseUrl(BuildConfig.API_BASE_URL)
            .build();
    BubblService api = retrofit.create(BubblService.class);

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
        DownloadGroupsAndMembersTask getGroups = new DownloadGroupsAndMembersTask();
        getGroups.execute(null, null,null);
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

            String membersInGroup = "";
            for (User member : (List<User>)group.getMembers()) {
                membersInGroup += member.getFirstName() + ", ";
            }

            membersInGroup = membersInGroup.trim().substring(0, membersInGroup.length() - 2);

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
            Call<List<Group>> getGroups = api.getGroups(UserProfile.getAuthenticationToken(getActivity()));
            try {
                usersGroups = getGroups.execute().body();
                for (Group group : usersGroups) {
                    Call<List<User>> getMembersInGroup = api.getMembersInGroup(group.getGroupId(), UserProfile.getAuthenticationToken(getActivity()));
                    List<User> membersInGroup = getMembersInGroup.execute().body();
                    removeThisUserFromMemberList(membersInGroup);
                    group.setMembers(membersInGroup);
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
        }

        private void removeThisUserFromMemberList(List<User> membersInGroup) {
            for (User user : membersInGroup) {
                if (user.getUserId() == UserProfile.getUserId(getActivity())) {
                    membersInGroup.remove(user);
                }
            }
        }
    }

    public interface OnGroupSelectedListener {
        void updateGroupSelected(Group group);
    }

    private void bindOnClickListener() {
        AdapterView.OnItemClickListener listener = new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                ((SelectGroupDialog.OnGroupSelectedListener) getActivity()).updateGroupSelected((Group) parent.getItemAtPosition(position));
            }
        };

        ((ListView)getView().findViewById(R.id.users_groups)).setOnItemClickListener(listener);
    }
}