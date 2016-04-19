package com.jeff_fennell.capstone;

import com.jeff_fennell.capstone.entities.Image;
import com.jeff_fennell.capstone.entities.LoginResult;
import com.jeff_fennell.capstone.entities.Group;
import com.jeff_fennell.capstone.entities.Invite;
import com.jeff_fennell.capstone.entities.User;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Headers;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface BubblService {

    @POST("users")
    Call<LoginResult> createUser (@Body User user);

    @POST("tokens")
    Call<LoginResult> login (@Body User user);

    @GET("groups")
    Call<List<Group>> getGroups(@Header("x-access-token") String token);

    @POST("groups")
    Call<Group> createNewGroup(@Body Group group, @Header("x-access-token") String token);

    @DELETE("groups/{groupId}")
    Call<Void> deleteGroup(@Path("id") long id, @Header("x-access-token") String token);

    @GET("invites")
    Call<List<Invite>> getInvites(@Header("x-access-token") String token);

    @Headers("Content-Type:  application/json")
    @POST("invites")
    Call<Void> acceptInvite(@Body Group group, @Header("x-access-token") String token);

    @DELETE("invites/{inviteId}")
    Call<Void> deleteInvite(@Path("inviteId") long inviteId, @Header("x-access-token") String token);

    @GET("members")
    Call<List<User>> getMembersInGroup(@Query("groupId")long groupId, @Header("x-access-token") String token);

    @POST("members")
    Call<Void> inviteMemberToGroup(@Query("username")String username, @Query("groupId")long groupId, @Header("x-access-token") String token);

    @DELETE("members/{memberId}")
    Call<Void> deleteMemberFromGroup(@Path("memberId") long memberId, @Query("groupId")long groupId, @Header("x-access-token") String token);

    @GET("images")
    Call<List<Image>> getImages(@Query("type") String type, @Query("groupId")long groupId, @Header("x-access-token") String token);
}