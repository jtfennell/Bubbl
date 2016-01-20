# capstone
<h3>Description</h3>
  <p> 
    This application will be an Android application meant to replace the native camera app, that automates the process of sharing photos with friends and family. In order to share photos with friends and family, the process traditionally takes multiple different applications: a photo camera application, a gallery application, and a messaging application. The user must individually select photos and send them to the desired users. This is not a hard task, but can easily become repetitive and take considerably longer when sending multiple photos at once. Limits on the number of photos that can be attached to a single message may even further prolong the process. The purpose of this app is to combine each of these three different applications into one; it will allow users to select who they share photos with at picture-taking time, and automatically send the photos to those users in the background, liberating users of the task of manually sharing the photos.
  </p>
  <p>
    Each user of the application must register, in order to keep track of the user groups they are a part of. By default,the application will launch to the camera functionality. From here, the user can navigate to a second screen that allows them to create user groups with other registered users. At picture taking time, the user can select a user group to send all of the pictures to, and if selected, the photos will automatically be shared with other users in the group. From the main camera functionality, there is also a link to the photo gallery, which consists of all of the local pictures stored on a user's device, as well as any photos that have been shared with the user in the groups they belong to.
  </p>
  <p>
  The application will be multithreaded, to allow for processing of photos and sending them in the background. It will consist of a REST API using Node.js/JavaScript. In addition to the main UI thread, there will be a background thread to communicate with the API to store photos and associate them with the user groups.
  </p>
<h3>Technologies</h3>
<ul>
  <li>Java/Android SDK</li>
  <li>Node.js/JavaScript</li>
  <li>Retrofit</li>
</ul>

<h3>Architecture</h3>
Android client -> Node.js REST API

<h3>Notable Android APIs</h3>
<ul>
  <li>Camera2</li>
</ul>
