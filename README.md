# mgm

This branch of MGM is a partial rewrite in node-js.  MOSES is shifting towards supporting the halcyon fork of OpenSimulator, and is dropping support for Simiangrid-based front-ends.  This rewrite currently has less funcitonality than the normal MGM: 1- halcyon does not have IAR support.  2- halcyon does not load OAR files accross a network connection, so the controls do not work in MGM. 3- Suspending users is not as explicit in halcyon as in simian, so the front-end must be configured using minloginlevel set to 1 for it to work.

# Upgrading

This branch does not perform any MySQL migration, use at your own risk.

# Installation

typings install
npm install
cp settings.js.example settings.js && vim settings.js
gulp && node dist/mgm.js

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
