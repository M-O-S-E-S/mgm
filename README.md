# mgm

MGM is a grid manager for project MOSES, which you can read more at militarymetaverse.org.

MGM is one half of a grid management solution for OpenSimulator, and now specifically the Halcyon branch.  MGM is a user management, process management, content, and region deployment web application.  When coupled with mgmNode, which is another process that confiugred and launches processes on command from MGM, allows a user to create estates, create regions, deploy the regions to servers, and start them from a single authenticated web interface.

# Current Status

Project MOSES is phasing out OpenSimulator support.  We are not keeping up with upstream Opensim, and have little reason to do so.  MOSES is switching to the Halcyon branch of OpenSimulator, as used by InWorldz.  The MGM and MGMNode code is being updated to reflect this.

MGM is being rewritten to utilize a node-js backend in the hopes of doing real-time data in the future.  It is not perfect, but I do not have the time to do what it needs to be really great.  You can see the beginnings of that in the react branch.  I will develop as needed, but I will make time if others want to contribute.

This branch of MGM is a partial rewrite in node-js.  MOSES is shifting towards supporting the halcyon fork of OpenSimulator, and is dropping support for Simiangrid-based front-ends.  This rewrite currently has less functionality than the normal MGM: 1- halcyon does not have IAR support.  2- halcyon does not load OAR files across a network connection, so the controls do not work in MGM. 3- Suspending users is not as explicit in halcyon as in simian, so the front-end must be configured using minloginlevel set to 1 for it to work.  Other pieces may not function either, as I have been forced to move quickly on the minimum viable product.

# Upgrading

This branch does not perform any MySQL migration, use at your own risk.

# Installation

typings install
npm install
cp settings.js.example settings.js && vim settings.js
gulp && node dist/mgm.js

to manually create users on the command line:
node dist/cli.js createUser FNAME LNAME PASSWORD [EMAIL] [GODLEVEL]

Initialize the mgm database by applying the sql files under doc in order.

# Other Information

This mgm installation is written against a similar branch for mgmNode, which has been rolled back to tag 1.0 for better windows support and to undo all python twisted modifications.

This node application should be behind an nginx instance that serves the contents of the html folder, and proxies all calls for the router /server to the node process.

bots.ts/bots.js
this is a simple script to create/delete a lot of bots.  It operates over a text file called users.txt, which is composed of a series of json records, one per line.  The records should take the form:

{
  fname: 'firstName',
  lname: 'lastName',
  password: 'desiredPassword',
  email: 'emailAddress'
}

Note that unlike on simiangrid, emailAddresses do not need to be unique.
