package com.jeff_fennell.capstone;

import android.content.DialogInterface;
import android.os.AsyncTask;
import android.os.Bundle;
import android.app.Activity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.jeff_fennell.capstone.entities.Group;
import com.jeff_fennell.capstone.entities.Invite;
import java.io.IOException;
import java.lang.reflect.Array;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ViewInvites extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_invites);
    }

    @Override
    protected void onStart() {
        super.onStart();
        displayInvites();
    }

    private void displayInvites() {
        GetInvites getInvites = new GetInvites(this);
        getInvites.execute();
    }

    class GetInvites extends AsyncTask<Void, Void, List<Invite>> {
        private Activity activity;

        public GetInvites(Activity activity) {
            this.activity = activity;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected List<Invite> doInBackground(Void... params) {
            Call<List<Invite>> getInvites = Utils.getClient().getInvites(UserProfile.getAuthenticationToken(activity));
            List<Invite> invites = null;
            try {
                invites = getInvites.execute().body();
            } catch (IOException e) {

            }
            return invites;
        }

        @Override
        protected void onPostExecute(List<Invite> invites) {
            if (invites.size() < 1) {
                findViewById(R.id.no_invite_message).setVisibility(View.VISIBLE);
            } else {
                ListView listView = (ListView)activity.findViewById(R.id.invite_list);
                listView.setAdapter(new InviteAdapter(invites));
            }
        }

        public class InviteAdapter extends ArrayAdapter<Invite> {
            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                final Invite invite = getItem(position);
                final Group group = invite.getGroup();
                LinearLayout inviteView = null;
                if (convertView == null) {
                    inviteView = (LinearLayout)getLayoutInflater().inflate(R.layout.invite_list_view, parent, false);
                    TextView groupName = (TextView)inviteView.findViewById(R.id.group_name);
                    groupName.setText(group.getName());
                } else {
                    inviteView = (LinearLayout)convertView;
                    TextView groupName = (TextView)inviteView.findViewById(R.id.group_name);
                    groupName.setText(group.getName());
                }

                Button joinGroupButton = (Button)inviteView.findViewById(R.id.join_group_button);
                Button deleteInviteButton = (Button)inviteView.findViewById(R.id.delete_invite_button);

                joinGroupButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(final View v) {
                        Call acceptInvite = Utils.getClient().acceptInvite(
                            group,
                            UserProfile.getAuthenticationToken(activity)
                        );

                        acceptInvite.enqueue(new Callback() {
                            @Override
                            public void onResponse(Call call, Response response) {
                                if (response.isSuccessful()) {
                                    Utils.toast(activity,R.string.invite_accept_success, Toast.LENGTH_LONG);
                                    removeInviteFromList(invite);

                                } else {
                                    Utils.toast(activity,R.string.invite_accept_failure, Toast.LENGTH_LONG);
                                }
                            }

                            @Override
                            public void onFailure(Call call, Throwable t) {
                                Utils.toast(activity,R.string.invite_accept_failure, Toast.LENGTH_LONG);
                            }
                        });
                    }
                });

                deleteInviteButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        Call deleteInvite = Utils.getClient().deleteInvite(
                                invite.getInviteId(),
                                UserProfile.getAuthenticationToken(activity)
                        );
                        deleteInvite.enqueue(new Callback() {
                            @Override
                            public void onResponse(Call call, Response response) {
                                if (response.isSuccessful()) {
                                    Utils.toast(activity,R.string.invite_delete_success, Toast.LENGTH_LONG);
                                    removeInviteFromList(invite);
                                } else {
                                    Utils.toast(activity,R.string.invite_delete_failure, Toast.LENGTH_LONG);
                                }
                            }

                            @Override
                            public void onFailure(Call call, Throwable t) {
                                Utils.toast(activity,R.string.invite_delete_failure, Toast.LENGTH_LONG);
                            }
                        });
                    }
                });

                return inviteView;
            }

            public InviteAdapter(List<Invite> invites) {
                super(getApplicationContext(), R.layout.invite_list_view, invites);
            }
        }
    }

    private void removeInviteFromList(Invite invite) {
        ListView invites = ((ListView) findViewById(R.id.invite_list));
        ArrayAdapter<Invite> adapter = (ArrayAdapter)invites.getAdapter();
        adapter.remove(invite);
    }
}
