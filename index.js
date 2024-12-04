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
    app.post('/loginLanding', async (req, res) => {
      const { username, password } = req.body; // Extract username and password from the request body

      try {
        // Query the database for a user with the given username and password
        const user = await knex('AdminUsers') // Use table AdminUsers
          .select('*')
          .where({ username, password }) // Matches username and password directly
          .first(); // Retrieves the first matching record
    
        // Check if a user was found
        if (user) {
          const success = true; // Set success to true for a valid user
          res.json({ success, message: 'Login successful' });
        } else {
          const success = false; // Set success to false for an invalid user
          res.json({ success, message: 'Username or password is incorrect' });
        }
      } catch (error) {
        console.error(error); // Log the error for debugging purposes
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
      
      
      //edit event get


      //edit event post


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