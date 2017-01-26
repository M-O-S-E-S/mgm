# mgm

MGM is a grid manager for project MOSES, a self-contained deployment strategy for OpenSimulator-based virtual worlds.  You can read more at militarymetaverse.org

MGM is one half of a grid management solution for OpenSimulator, and now specifically the Halcyon branch.  MGM is a user management, process management, content, and region deployment web application.  When coupled with mgmNode, which is another process that confiugred and launches processes on command from MGM, allows a user to create estates, create regions, deploy the regions to servers, and start them from a single authenticated web interface.

# Current Status

The mgm codebase has been refactored.  It now uses ReactJS instead of AngularJS.  It is using NodeJS and Sequelize instead of PHP or the transitory nodeJs implementation.  It is mostly funcitonal, though it is not completely tested.  Please issue bugs and pull requests when issues are found.  The old Opensim code will be retired to an opensim branch, and is no longer maintained.

This codebase is deployed on a publicly available grid, and will receive fixes as problems are discovered.

# Upgrading

This branch does not perform any MySQL migration.  If you are on an older version of MGM, reference the SQL files under serverFiles.  We have a version number inserted, but no automated way to migrate the database at this time.

# Installation

typings install
npm install
cp settings.js.example settings.js && vim settings.js

# Compilation

This project is written in typescript, and must be compiled before it can be used

compile client:  npm run build-client
compile server: npm run build-server

compile client in production mode:  npm run build-client-production

- The mechansim to create users via the command line is not functional at this time.

Initialize the mgm database by applying the sql files under serverFiles in order.

# Deployment

MGM's server.js file does not serve static files.  Instead host this behind an nginx instance, an example config file for which is located inside serverFiles.

The nginx instance should redirect all traffic on the /api prefix to the mgm instance.  All other routes should either match and serve a static file or serve index.html for html5 pushstate.

# Migration

There are no migration tools provided at this time for either OpenSimulator, or Simiangrid based Grids.  While OAR files are supported, several functions were implemented separately in halcyon from opensim, so anything reliant on osFunctions to operate will be broken until they can be modified to use halcyon function calls.
