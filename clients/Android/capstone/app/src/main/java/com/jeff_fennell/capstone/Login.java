package com.jeff_fennell.capstone;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import com.jeff_fennell.capstone.entities.LoginResult;
import com.jeff_fennell.capstone.entities.User;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class Login extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        UserProfile.logout(this);
        if (UserProfile.isLoggedIn(this)) {
            launchCamera();
        }
    }

    public void launchCreateAccount(View view) {
        Intent createAccount = new Intent(this, CreateAccount.class);
        startActivity(createAccount);
    }

    public void validateInputsAndAttemptLogin(View view) {
        if(!usernameAndPasswordValid()) {
            setErrors();
        } else {
            attemptLogin();
        }
    }

    private boolean usernameAndPasswordValid() {
        String username = getUsername();
        String password = getPassword();

        return usernameValid() && passwordValid();
    }

    private void setErrors() {
        if (!usernameValid()) {
            ((EditText)findViewById(R.id.login_username))
                .setError(getString(R.string.login_username_invalid));
        }

        if (!passwordValid()) {
            ((EditText)findViewById(R.id.login_password))
                .setError(getString(R.string.login_password_invalid));
        }
    }

    private boolean usernameValid() {
        String username = getUsername();
        return username.length() > 0;
    }

    private boolean passwordValid() {
        String password = getPassword();
        return password.length() > 0;
    }

    private String getUsername() {
        EditText usernameEditText = (EditText)findViewById(R.id.login_username);
        return usernameEditText.getText().toString().trim();
    }

    private String getPassword() {
        EditText passwordEditText = (EditText)findViewById(R.id.login_password);
        return passwordEditText.getText().toString().trim();
    }

    private void attemptLogin() {
        User user = new User(getUsername(), getPassword());

        Retrofit retrofit = new Retrofit.Builder()
                .addConverterFactory(GsonConverterFactory.create())
                .baseUrl(BuildConfig.API_BASE_URL)
                .build();
        BubblService api = retrofit.create(BubblService.class);

        Call<LoginResult> loginUser = api.login(user);
        loginUser.enqueue(new Callback<LoginResult>() {
            @Override
            public void onResponse(Call call, Response response) {
                int code = response.code();

                if (response.isSuccessful()) {
                    LoginResult userInfo = (LoginResult)response.body();
                    persist(userInfo);
                    launchCamera();
                } else {
                    Context context = getApplicationContext();
                    CharSequence text = "login failed!";
                    int duration = Toast.LENGTH_SHORT;

                    Toast toast = Toast.makeText(context, text, duration);
                    toast.show();
                }
            }

            @Override
            public void onFailure(Call call, Throwable t) {
                Context context = getApplicationContext();
                CharSequence text = "login failed!";
                int duration = Toast.LENGTH_SHORT;

                Toast toast = Toast.makeText(context, text, duration);
                toast.show();
            }
        });
    }

    private void launchCamera() {
        Intent camera = new Intent(this, CameraActivity.class);
        startActivity(camera);
    }

    private void persist(LoginResult userLoginInfo) {
        User user = userLoginInfo.getUser();
        UserProfile.saveAuthenticationToken(userLoginInfo.getToken(), this);
        UserProfile.saveUserId(user.getUserId(), this);
        UserProfile.saveFirstName(user.getFirstName(), this);
        UserProfile.saveLastName(user.getLastName(), this);
        UserProfile.saveLoginStatus(this);
        //TODO
//        UserProfile.saveUserPhoto(user.getPhotourl(),this);
    }
}
