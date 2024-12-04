let express = require('express');
let app = express();
let path = require('path');
const PORT = process.env.PORT || 3000
// grab html form from file 
// allows to pull JSON data from form 
app.use(express.urlencoded( {extended: true} )); 

const knex = require("knex") ({
  client : "pg",
  connection : {
  host : process.env.RDS_HOSTNAME || "awseb-e-3zkyhjrvkh-stack-awsebrdsdatabase-uvmpb6v1jjeb.cf6qyccwqo8c.us-east-1.rds.amazonaws.com",
  user : process.env.RDS_USERNAME || "ebroot",
  password : process.env.RDS_PASSWORD || "sqldatabase9128",
  database : process.env.RDS_DB_NAME || "ebdb",
  port : process.env.RDS_PORT || 5432,
  ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false  // Fixed line
}
})

// Middleware to parse JSON bodies
app.use(express.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.use('/Images', express.static(path.join(__dirname, 'Images')));
// Define route for home page

// Serve the root route
app.get('/', (req, res) => {
  res.render('home');  // Renders 'home.ejs' file
});

/*ADMIN LOGIN ROUTES*/


    // Serve the login landing page (loginLanding.ejs)
    app.get('/loginLanding', (req, res) => {
      res.render('loginLanding', { errorMessage: null});  // Renders 'loginLanding.ejs' file
    });

    //post for login
    app.post('/login', async (req, res) => {
      console.log('Received POST request for login', req.body); // Log the received data
    
      const { username, password } = req.body;
    
      try {
        const user = await knex('adminusers')
          .select('*')
          .where({ username, password })
          .first();
        console.log('User fetched from DB:', user); // Log the user object fetched from DB
    
        if (user) {
          res.json({ success: true, message: 'Login successful' });
        } else {
          res.json({ success: false, message: 'Username or password is incorrect' });
        }
      } catch (error) {
        console.error('Error during database query:', error); // Log the error during the database query
        res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
      }
    });
    

    /*ADMIN MAINTENANCE ROUTES*/
      //add admin get

      //add admin post
        
      
      //edit admin get

      //edit admin post


      //delete admin


    /*ADMIN VOLUNTEER MAINTENANCE ROUTES*/
      //add volunteer get (same as how can i help--sign up add volunteer route)

      //add volunteer post
        
      
      //edit volunteer get


      //edit volunteer post


      //delete volunteer


    /*ADMIN EVENT MAINTENANCE ROUTES*/
      //add event get
        //same route as the how can i help request event except this one does not need to be approved
      
      //add event post 
      
      
      // Route to render the eventMaintenance page
      app.get('/eventMaintenance', async (req, res) => {
        try {
          const pastEvents = await knex('requestedevents')
            .select('pastevents.*', 'requestedevents.*')
            .leftJoin('pastevents', 'pastevents.requestid', 'requestedevents.requestid');

          // Fetch pending and approved future events
          const pendingEvents = await knex('requestedevents')
            .select('*')
            .where({ approved: false }) // Fetch only pending events
            .andWhere('eventdate', '>=', knex.fn.now()); // Ensure the date is in the future

          const approvedEvents = await knex('requestedevents')
            .select('*')
            .where({ approved: true }) // Fetch only approved events
            .andWhere('eventdate', '>=', knex.fn.now()); // Ensure the date is in the future

          // Render the eventMaintenance view with the data
          res.render('eventMaintenance', {
            pastEvents,
            pendingEvents,
            approvedEvents,
          });
        } catch (err) {
          console.error('Error retrieving events from the database:', err);
          res.status(500).send('Error retrieving events from the database.');
        }
      });
        
      //edit event get
      // GET route to fetch a specific event for editing
          app.get('/editEvent/:id', async (req, res) => {
            const { id } = req.params;
            try {
              // Fetch the specific event by ID
              const event = await knex('requestedevents')
                .select('*')
                .where({ requestid: id })
                .first();

              if (!event) {
                return res.status(404).send('Event not found.');
              }

              res.render('editEvent', { event });
            } catch (err) {
              console.error('Error fetching event for editing:', err);
              res.status(500).send('Error fetching event for editing.');
            }
          });

          // POST route to update a specific event
          app.post('/editEvent/:id', async (req, res) => {
            const { id } = req.params;

            // Extract form data and handle the approved checkbox
            const {
              contactfirstname,
              contactlastname,
              contactemail,
              contactnumber,
              eventdate,
              eventstarttime,
              eventlength,
              eventaddress,
              eventcity,
              eventstate,
              eventzipcode,
              estimatedattendance,
            } = req.body;

            const approved = req.body.approved === 'on'; // Handle checkbox as boolean

            try {
              // Update the event in the database
              await knex('requestedevents')
                .where({ requestid: id })
                .update({
                  contactfirstname,
                  contactlastname,
                  contactemail,
                  contactnumber,
                  eventdate,
                  eventstarttime,
                  eventlength,
                  eventaddress,
                  eventcity,
                  eventstate,
                  eventzipcode,
                  estimatedattendance,
                  approved,
                });

              res.redirect('/eventMaintenance'); // Redirect back to event maintenance page
            } catch (err) {
              console.error('Error updating event:', err);
              res.status(500).send('Error updating event.');
            }
          });
      


      //delete event


/*HOW CAN I HELP ROUTES*/
  /*SIGN UP ROUTES*/
      //add volunteer get (same as admin voluteer add route)

      //add voluteer post form route

  /*REQUEST EVENT ROUTES*/
      //request Event get


      //request Event post


// port number, (parameters) => what you want it to do.
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));