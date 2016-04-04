package com.jeff_fennell.capstone;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import com.jeff_fennell.capstone.entities.LoginResult;
import com.jeff_fennell.capstone.entities.User;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class CreateAccount extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_account);
    }

    public void validateFieldsAndCreateAccount(View view) {
        if (!allInputFieldsValid()) {
            setErrors();
        } else {
            tryToCreateAccount();
        }
    }

    private boolean allInputFieldsValid() {
        return usernameValid()
                && firstNameValid()
                && lastNameValid()
                && emailValid()
                && passwordValid()
                && passwordConfirmMatchesPassword();
    }

    private boolean usernameValid() {
       return getUsername().length() >= 4;
    }

    private boolean firstNameValid() {
        return getFirstName().length() > 0;
    }

    private boolean lastNameValid() {
        return getLastName().length() > 0;
    }

    private boolean emailValid() {
        return getEmail().length() > 0 && getEmail().contains("@");
    }

    private String getUsername(){
        return Utils.getTrimmedEditTextInput(this, R.id.create_account_username);
    }

    private String getFirstName() {
        return Utils.getTrimmedEditTextInput(this, R.id.create_account_first_name);
    }

    private String getLastName() {
        return Utils.getTrimmedEditTextInput(this, R.id.create_account_last_name);
    }

    private String getPassword() {
       return Utils.getTrimmedEditTextInput(this, R.id.create_account_password);
    }

    private String getEmail() {
        return Utils.getTrimmedEditTextInput(this, R.id.create_account_email);
    }

    private String getPasswordConfirm() {
        return Utils.getTrimmedEditTextInput(this, R.id.create_account_password_confirm);
    }

    private boolean passwordValid() {
        return getPassword().length() >= 8;
    }

    private boolean passwordConfirmMatchesPassword() {
        return getPassword().equals(getPasswordConfirm());
    }

    private void setErrors() {
        if (!usernameValid()) {
            Utils.setEditTextError(this, R.id.create_account_username, R.string.create_account_username_error);
        }

        if (!passwordValid()) {
            Utils.setEditTextError(this, R.id.create_account_password, R.string.create_account_password_error);
        }

        if (!firstNameValid()) {
            Utils.setEditTextError(this, R.id.create_account_first_name, R.string.create_account_first_name_error);
        }

        if (!lastNameValid()) {
            Utils.setEditTextError(this, R.id.create_account_last_name, R.string.create_account_last_name_error);
        }

        if (!emailValid()) {
            Utils.setEditTextError(this, R.id.create_account_email, R.string.create_account_email_error);
        }

        if (!passwordConfirmMatchesPassword()) {
            Utils.setEditTextError(this, R.id.create_account_password_confirm, R.string.create_account_password_match_error);
            Utils.setEditTextError(this, R.id.create_account_password , R.string.create_account_password_match_error);

        }
    }

    private void tryToCreateAccount() {
        User newUser = new User(
                getUsername(),
                getPassword(),
                getFirstName(),
                getLastName(),
                getEmail()
        );

        Retrofit retrofit = new Retrofit.Builder()
                .addConverterFactory(GsonConverterFactory.create())
                .baseUrl(BuildConfig.API_BASE_URL)
                .build();
        BubblService api = retrofit.create(BubblService.class);

        Call<LoginResult> createUser = api.createUser(newUser);
        createUser.enqueue(new Callback<LoginResult>() {
            @Override
            public void onResponse(Call<LoginResult> call, Response<LoginResult> response) {
                if (response.isSuccessful()) {
                    LoginResult userInfo = response.body();
                    persist(userInfo);

                    Context context = getApplicationContext();
                    CharSequence text = "Account created!";
                    int duration = Toast.LENGTH_SHORT;

                    Toast toast = Toast.makeText(context, text, duration);
                    toast.show();
                    launchCamera();
                }
            }

            @Override
            public void onFailure(Call<LoginResult> call, Throwable t) {

            }
        });
    }

    private void persist(LoginResult userLoginInfo) {
        User user = userLoginInfo.getUser();
        UserProfile.saveAuthenticationToken(userLoginInfo.getToken(), this);
        UserProfile.saveUserId(user.getUserId(), this);
        UserProfile.saveFirstName(user.getFirstName(), this);
        UserProfile.saveLastName(user.getLastName(), this);
        UserProfile.saveLoginStatus(this);
    }

    private void launchCamera() {
        Intent camera = new Intent(this, CameraActivity.class);
        startActivity(camera);
    }
}