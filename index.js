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
  host : process.env.RDS_HOSTNAME || "localhost",
  user : process.env.RDS_USERNAME || "postgres",
  password : process.env.RDS_PASSWORD || "admin123",
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
      //add event get
        //same route as the how can i help request event except this one does not need to be approved
      
      //add event post 
      
      
      // Route to display the eventMaintenance page

        app.get("/eventMaintenance", async (req, res) => {
          try {
            const pastEvents = await knex("pastevents").select("*");
            const pendingEvents = await knex("requestedevents").where("approved", false).select("*");
            const approvedFutureEvents = await knex("requestedevents")
              .where("approved", true)
              .andWhere("eventdate", ">", new Date())
              .select("*");
        
            res.render("eventMaintenance", {
              pastEvents,
              pendingEvents,
              approvedFutureEvents,
            });
          } catch (error) {
            console.error(error);
            res.status(500).send("Error retrieving events from the database.");
          }
        });
        
      //edit event get
      // Route to display the edit event form
      app.get('/editEvent/:id', async (req, res) => {
        const { id } = req.params;
      
        try {
          const event = await knex('requestedevents').where({ requestid: id }).first(); // Adjust column names if needed
          if (!event) {
            return res.status(404).send('Event not found');
          }
          res.render('editEvent', { event });
        } catch (error) {
          console.error(error);
          res.status(500).send('Server error');
        }
      });
      
      //edit event post
      // Route to handle the update of an event
      app.post('/editEvent/:id', async (req, res) => {
        const { id } = req.params;
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
      
        try {
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
            });
      
          res.redirect('/eventMaintenance');
        } catch (error) {
          console.error(error);
          res.status(500).send('Server error');
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
app.listen(PORT, () => console.log('Server started on port ' + PORT));