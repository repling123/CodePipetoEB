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
  host : process.env.RDS_HOSTNAME || 
  // "awseb-e-3zkyhjrvkh-stack-awsebrdsdatabase-uvmpb6v1jjeb.cf6qyccwqo8c.us-east-1.rds.amazonaws.com",
  "localhost",
  user : process.env.RDS_USERNAME || 
  // "ebroot",
  "postgres",
  password : process.env.RDS_PASSWORD || 
  // "sqldatabase9128",
  "sweatersanitizerhairclip",
  database : process.env.RDS_DB_NAME || 
  "deletelater",
  // "ebdb",
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
    // Route to fetch all admin users and render the admin maintenance page
    app.get('/admin', async (req, res) => {
      try {
        // Query to select all rows from the `adminusers` table
        const result = await pool.query('SELECT * FROM adminusers');

        // Render the admin maintenance page and pass the data
        res.render('adminMaintenance', { adminusers: result.rows });
      } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).send('Error fetching admin users.');
      }
    });

    // Route to add a new admin (GET)
    app.get('/addAdmin', (req, res) => {
      res.render('addAdmin'); // Render the addAdmin page
    });

    // Route to add a new admin (POST)
    app.post('/addAdmin', async (req, res) => {
      const { username, password } = req.body;
      try {
        await pool.query('INSERT INTO adminusers (Username, Password) VALUES ($1, $2)', [username, password]);
        res.redirect('/adminMaintenance');
      } catch (error) {
        console.error('Error adding admin user:', error);
        res.status(500).send('Error adding admin user.');
      }
    });

 // Route to edit an admin (GET)
app.get('/editAdmin/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM adminusers WHERE UserID = $1', [id]);
    res.render('editAdmin', { user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching admin user:', error);
    res.status(500).send('Error fetching admin user.');
  }
});

// Route to edit an admin (POST)
app.post('/editAdmin/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    await pool.query('UPDATE adminusers SET Username = $1, Password = $2 WHERE UserID = $3', [username, password, id]);
    res.redirect('/adminMaintenance');
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).send('Error updating admin user.');
  }
});

  // Route to delete an admin (DELETE)
  app.delete('/deleteAdmin/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM adminusers WHERE user = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting admin user:', error);
      res.status(500).json({ success: false, message: 'Error deleting admin user.' });
    }
  });


    /*ADMIN VOLUNTEER MAINTENANCE ROUTES*/
      //add volunteer get (same as how can i help--sign up add volunteer route)

      //add volunteer post
        
      
      //edit volunteer get


      //edit volunteer post


      //delete volunteer


    /*ADMIN EVENT MAINTENANCE ROUTES*/
      // Route to add a new event (GET)      
      app.get('/addEvent', async (req, res) => {
        try {
          const preferredActivities = await knex('requestedevents').distinct('preferredactivity');
            const tableTypes = await knex('requestedevents').distinct(knex.raw('LOWER(tabletype) as tabletype'));
          res.render('addEvent', { preferredActivities, tableTypes });
        } catch (error) {
          console.error('Error fetching preferred activities:', error);
          res.status(500).send('Error fetching preferred activities.');
        }
      });

      // Route to add a new event (POST)
      app.post('/addEvent', async (req, res) => {
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
          preferredactivity,
          numsewers,
          tabletype,
          otherinfo,
        } = req.body;

        const approved = req.body.approved === 'true'; // Handle checkbox as boolean
        const flexibledate = req.body.flexibledate === 'true'; // Handle checkbox as boolean
        const sufficientsewmachines = req.body.sufficientsewmachines === 'true'; // Handle checkbox as boolean
        const sufficienttables = req.body.sufficienttables === 'true'; // Handle checkbox as boolean
        const jenstory = req.body.jenstory === 'true'; // Handle checkbox as boolean

        try {
          // Insert the new event into the database
          await knex('requestedevents').insert({
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
            preferredactivity,
            flexibledate,
            sufficientsewmachines,
            numsewers,
            sufficienttables,
            tabletype,
            jenstory,
            otherinfo,
            approved,
          });

          res.redirect('/eventMaintenance'); // Redirect back to event maintenance page
        } catch (err) {
          console.error('Error adding event:', err);
          res.status(500).send('Error adding event.');
        }
      });
      
      
      // Route to add a new past event (GET)
      app.get('/addPastEvent', (req, res) => {
        res.render('addPastEvent'); // Render the addPastEvent page
      });

      // Route to add a new past event (POST)
      app.post('/addPastEvent', async (req, res) => {
        const {
          pasteventdate,
          pasteventtime,
          eventdurationhours,
          pasteventaddress,
          pasteventcity,
          pasteventstate,
          pasteventzipcode,
          pasteventparticipants,
          itemsproduced,
          pockets,
          collars,
          envelopes,
          vests,
          completedproducts,
        } = req.body;

        try {
          // Insert the new past event into the database
          await knex('pastevents').insert({
            pasteventdate,
            pasteventtime,
            eventdurationhours,
            pasteventaddress,
            pasteventcity,
            pasteventstate,
            pasteventzipcode,
            pasteventparticipants,
            itemsproduced,
            pockets,
            collars,
            envelopes,
            vests,
            completedproducts,
          });

          res.redirect('/eventPastMaintenance'); // Redirect back to past events maintenance page
        } catch (err) {
          console.error('Error adding past event:', err);
          res.status(500).send('Error adding past event.');
        }
      });


      // Route to render the eventMaintenance page
      app.get('/eventMaintenance', async (req, res) => {
        try {
          // Fetch pending events
          const pendingEvents = await knex('requestedevents')
        .select('*')
        .where({ approved: false })
        .orderBy('eventdate', 'asc');

          // Fetch approved future events
          const approvedFutureEvents = await knex('requestedevents')
        .select('*')
        .where({ approved: true })
        .andWhere('eventdate', '>=', knex.fn.now())
        .orderBy('eventdate', 'asc');

          res.render('eventMaintenance', { pendingEvents, approvedFutureEvents });
        } catch (err) {
          console.error('Error fetching events:', err);
          res.status(500).send('Error fetching events.');
        }
      });
      
      
      //edit event get
      // GET route to fetch a specific event for editing
      app.get('/editEvent/:id', async (req, res) => {
        const { id } = req.params;
        try {
          const preferredActivities = await knex('requestedevents').distinct('preferredactivity');
          const tableTypes = await knex('requestedevents').distinct(knex.raw('LOWER(tabletype) as tabletype'));
          // Fetch the specific event by ID
          const event = await knex('requestedevents')
        .select('*')
        .where({ requestid: id })
        .first();

          if (!event) {
        return res.status(404).send('Event not found.');
          }

          res.render('editEvent', { event, preferredActivities, tableTypes });
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
              preferredactivity,
              numsewers,
              tabletype,
              otherinfo,
            } = req.body;

            const approved = req.body.approved === 'true'; // Handle checkbox as boolean
            const flexibledate = req.body.flexibledate === 'true'; // Handle checkbox as boolean
            const sufficientsewmachines = req.body.sufficientsewmachines === 'true'; // Handle checkbox as boolean
            const sufficienttables = req.body.sufficienttables === 'true'; // Handle checkbox as boolean
            const jenstory = req.body.jenstory === 'true'; // Handle checkbox as boolean

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
                preferredactivity,
                flexibledate,
                sufficientsewmachines,
                numsewers,
                sufficienttables,
                tabletype,
                jenstory,
                otherinfo,
                approved,
              });

              res.redirect('/eventMaintenance'); // Redirect back to event maintenance page
            } catch (err) {
              console.error('Error updating event:', err);
              res.status(500).send('Error updating event.');
            }
            });


      //delete event
      // POST route to delete a specific event
    
      app.post('/deleteEvent/:id', async (req, res) => {
        const id = req.params.id;
        try {
          // Delete the record in requestedevents table
          await knex('requestedevents')
            .where('requestid', id)
            .del();

          res.redirect('/eventMaintenance'); // Redirect to the event maintenance page after deletion
        } catch (error) {
          console.error('Error deleting event:', error);
          res.status(500).send('Internal Server Error');
        }
      });

      //eventPastMaintenance routes
      // Route to render the past events maintenance page
      app.get('/eventPastMaintenance', async (req, res) => {
        try {
          // Fetch past events
          const pastEvents = await knex('pastevents').select('*')
          .orderBy('pasteventdate', 'desc');
          res.render('eventPastMaintenance', { pastEvents });
        } catch (err) {
          console.error('Error fetching past events:', err);
          res.status(500).send('Error fetching past events.');
        }
      });


      //editPastEvent routes
      // GET route to fetch a specific past event for editing
      app.get('/editPastEvent/:id', async (req, res) => {
        const { id } = req.params;
        try {
          // Fetch the specific past event by ID
          const event = await knex('pastevents')
            .select('*')
            .where({ eventid: id })
            .first();

          if (!event) {
            return res.status(404).send('Past event not found.');
          }

          res.render('editPastEvent', { event });
        } catch (err) {
          console.error('Error fetching past event for editing:', err);
          res.status(500).send('Error fetching past event for editing.');
        }
      });

      // POST route to update a specific past event
      app.post('/editPastEvent/:id', async (req, res) => {
        const { id } = req.params;
        const {
          pasteventdate,
          pasteventtime,
          eventdurationhours,
          pasteventaddress,
          pasteventcity,
          pasteventstate,
          pasteventzipcode,
          pasteventparticipants,
          itemsproduced,
          pockets,
          collars,
          envelopes,
          vests,
          completedproducts,
          
        } = req.body;

        const updated = req.body.updated === 'true'; // Handle checkbox as boolean


        try {
          // Update the past event in the database
          await knex('pastevents')
        .where({ eventid: id })
        .update({
          pasteventdate,
          pasteventtime,
          eventdurationhours,
          pasteventaddress,
          pasteventcity,
          pasteventstate,
          pasteventzipcode,
          pasteventparticipants,
          itemsproduced,
          pockets,
          collars,
          envelopes,
          vests,
          completedproducts,
          updated: updated === 'true',
        });

          res.redirect('/eventPastMaintenance'); // Redirect back to past events maintenance page
        } catch (err) {
          console.error('Error updating past event:', err);
          res.status(500).send('Error updating past event.');
        }
      });


      // POST route to delete a specific past event
      app.post('/deletePastEvent/:id', async (req, res) => {
        const id = req.params.id;
        try {
          // Delete the record in pastevents table
          await knex('pastevents')
            .where('eventid', id)
            .del();

          res.redirect('/eventPastMaintenance'); // Redirect to the past events maintenance page after deletion
        } catch (error) {
          console.error('Error deleting past event:', error);
          res.status(500).send('Internal Server Error');
        }
      });


/*HOW CAN I HELP ROUTES*/
  /*SIGN UP ROUTES*/
      //add volunteer get (same as admin voluteer add route)

      //add voluteer post form route

  /*REQUEST EVENT ROUTES*/
      //request Event get


      //request Event post


// port number, (parameters) => what you want it to do.
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));