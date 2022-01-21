This document was coppied right from Canvas.

# Ride Share App

Implement the Ride Share system using the multi-tier web application architecture we have been studying.

1. [Vue (Links to an external site.)](https://vuejs.org/)-based user interface employing a single-page application model (the *View*)
2. RESTful API using [Hapi (Links to an external site.)](https://hapi.dev/) and [Joi (Links to an external site.)](https://hapi.dev/tutorials/validation/) (the *Controller*)
3. Data persistence using [Objection (Links to an external site.)](https://vincit.github.io/objection.js/), [Knex (Links to an external site.)](http://knexjs.org/), and [PostgreSQL (Links to an external site.)](https://www.postgresql.org/) (the *Model*)

## User Stories

Ride Share supports three key roles, outlined here. Each role has  specific capabilities, listed with a story identifier that consists of  a letter and number (e.g., *P2*). Use the story identifier to schedule and track your team's progress implementing each story.

### Administrator

An administrator has overall control of Ride Share.

- [x] A1 - Add and update a vehicle
- [x] A2 - Add a vehicle type
- [ ] A3 - Add and update a ride (including location and state)
- [ ] A4 - Assign and update a vehicle for a ride
- [ ] A5 - Authorize a driver for a vehicle
- [x] A6 - Get a report of all upcoming rides, including passenger(s) and driver(s)

### Passenger

A passenger can self-enroll in Ride Share and can sign up for an existing ride.

- [x] P1 - Sign up for Ride Share.
- [x] P2 - Sign up for a specific ride.
- [x] P3 - Get a report of all upcoming rides for one passenger.

### Driver

A driver can self-enroll in Ride Share, but must be authorized to  drive by a dispatcher. Once authorized, a driver can sign up to drive an authorized vehicle on an upcoming ride.

- [x] D1 - Sign up as a driver
- [x] D2 - Elect to drive for a ride; a driver can only sign up to drive on rides that have a vehicle for which the driver is authorized.
- [x] D3 - Get a report of all upcoming drives for one driver.

## Strategy

You can envision this Model-View-Controller architecture as a layer cake with the *model* layer at the bottom, the *view* layer on the top, and the *controller* layer in between. However, **do not** implement Ride Share one layer at a time (e.g., **do not** write the entire model layer before starting the other layers).

Instead, think of slicing the layer cake from top to bottom and implement *one slice at a time* (i.e., part of the model, part of the view, and part of the controller  that all work together to implement a single user story). Then take  another slice of the cake (user story) and implement all three layers  for that slice. Repeat until all user stories are complete.

## Guidelines

1. **Do not** implement a Ride Share "account" system (e.g.,  password-protected accounts, logging in, changing passwords, etc.).  Although a production version of Ride Share would include accounts and  the associated functionality, we want to focus on the Ride Share  functionality itself.

2. **Some of the reports for the Ride Share application are specific to a single user.** For example, D3 should show the drives for a specific  driver, and P3 should show the rides for a specific passenger. However,  since we are avoiding creation of accounts, login, and  so forth, we don't know which drives or rides to show, because we don't  really have a user. Some ways around the lack of a full account/login  system include:

	1.** On the pages that show user-specific reports, include a drop-down  list of users that you have manually added to your database. Filter the  list of rides or drives base on the selected user.**

	2. Add a drop-down that lets you select a user to the top menu bar.  Store that user as a global current user, and use that user when  generating user-specific reports. Essentially, this approach replaces  the whole sign-up/login process with a drop-down list (handy!). There's  an example this approach in the **ui-spa** example on GitHub. The idea is this:

		- Store the current user in the data of the top-level Vue object. See the src/main.js file, which has a data object called **currentUser**.
		- Because **currentUser** is defined on the top-level Vue object, you can access it using **this.$root.currentUser**. Vue defines **$root** specifically do let you access application-wide data. It's the global equivalent of accessing local component data using **this.someLocalDatum**. See src/pages/SignIn.vue for examples of how to access this object.
		- If you use this approach, you would set the value of **this.$root.currentUser** from the drop-down list mentioned above. When rendering a user-specific report (e.g., rides for a passenger), you would then use the current  value to query your database for user-specific values (e.g., rides).

3. You are to implement the functionality described in the User Stories section. The stories are grouped into the roles of Ride Share users.  Such grouping is mostly for the convenience of describing what Ride  Share does. You are not required to implement a role-based permission  system that limits what a user can do based on his or her role.

4. Implement user stories one at a time in priority order as you  imagine would be most important to the Ride Share sponsor organization.

## Submit

Submit to the course web site the URL of the GitHub repository containing your implementation of Ride Share. Please submit **one** URL for your team to the repository you want me to grade.

**Do not** check your *node_modules* directory into Git!
