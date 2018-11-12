//here i will be creating all the routes which i will be using for the application
//I will also be setting up all the references/connections using which i will make calls to my application
var express= require("express"),
    app =express(),
    bp = require("body-parser"),// required whenever POST requests are made
    methodOverride=require("method-override"),// required for update functionality
    mongoose = require("mongoose"),//connection to the DB
    passport = require("passport"),
    localStrategy = require("passport-local"),
    User = require("./models/user"),//creating a user to keep track of who makes changes in the application
    Customer = require("./models/customers"),//creating a Customer collection in the DB.
   // queryParser= require("query-parser"),
    Order = require("./models/order"),//creating a Order collection in the DB.
    Income = require("./models/income"),
    Expense = require("./models/expense");//creating a Order collection in the DB.



//APP CONFIG
mongoose.connect("mongodb://localhost/DBManager");
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.static("public"));
app.use(bp.urlencoded({extended: true}));
app.use(methodOverride("_method"));

//PASSPORT SETUP
app.use(require("express-session")({
    secret : "dikku is an asshole",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); //authenticate function comes with user-local-mongoose package
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//to make the status of currentUser available we will use the following middleware. Because of the use function it gets automaticall
//added to all the routes
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

//Create what the basic or Home route should display to the user
app.get("/", function(req,res){
    res.render("landing");
    });


//=====================================================================
//ADDING Income related ROUTES HERE
//=====================================================================

//when someone clicks on the income button, then i want the income page to get displayed
app.get("/income", function(req,res){
    res.render("./income/income");
    });

app.post("/income", function(req,res){
    var category=req.body.category,
        amount=req.body.amount;
    
    var newIncome={category: category, amount: amount };
    Income.create(newIncome,function(err, income){
        if(err){
            console.log(err);
        }else{
            console.log("new income added" + income);
            res.redirect("/income");
        }
    })
});
    
//=====================================================================
//ADDING expense related ROUTES HERE
//=====================================================================
//below page should get displayed when the expense link is clicked
app.get("/expense", function(req, res){
        res.render("./expense/expense");
});
app.post("/expense", function(req,res){
    var category=req.body.category,
        amount=req.body.amount;
    
    var newExpense={category: category, amount: amount };
    Expense.create(newExpense,function(err, expense){
        if(err){
            console.log(err);
        }else{
            console.log("new expense added" + expense);
            res.redirect("/expense");
        }
    })
});
//=====================================================================
//ADDING ROUTE HERE to check cashflow
//=====================================================================
//Here i am checking the cashflow from beginning to the end
//There has to be a way to filter the find statement based on some parameter like date... search how we can do that
app.get("/cashflow", function(req, res){
    Income.find({}, function(err, income){
        if(err){
            console.send("problem occured while finding income inside the cashflow route");
        }else{
            Expense.find({}, function(err,expense){
                if(err){
                    console.send("something went wrong while finding the expense inside cashflow route!!");
                }else{
                    var totalIncome=0;
                    var totalExpense=0;
                    income.forEach(function(income){
                    totalIncome+=income.amount;
                    });
                    expense.forEach(function(expense){
                        totalExpense+=expense.amount;
                    });
                    res.render("./cashflow/cashflow.ejs", {income:income , expense:expense, totalIncome, totalExpense});
                }
            });
        }
    });
});
//=====================================================================
//ADDING Customer related ROUTES HERE
//=====================================================================

//When someone clicks on the customer link on landing page below page should get displayed
app.get("/customers", function(req,res){
    res.render("./customers/customers");
});

//when create button is pressed in new.ejs the following route will be called
app.post("/customers",function(req, res){
    //Here i am extracting all the data from the submitted form.
    var name= req.body.customer_name,
        mobile_no = req.body.mobile_no,
        breakfast_cost= req.body.breakfast_cost,
        lunch_cost= req.body.lunch_cost,
        breakfast_default = req.body.breakfast_default,
        lunch_default= req.body.lunch_default;

    //now i will be creating a new object containing all the extracted values

    var newCustomer = {name : name, mobile_no: mobile_no, breakfast_cost: breakfast_cost,breakfast_default: breakfast_default, lunch_cost: lunch_cost, lunch_default: lunch_default };

    Customer.create(newCustomer, function(err, customer){
        if(err)
        {
            console.log(err);
        }else{
            console.log("new customer created: " + customer);
        }
    });
    //after creating the new customer i will be redirecting to the /customers page
    res.redirect("./customers/new");
});
//When someone clicks on the create new customer button on customers page below page should get displayed
app.get("/customers/new", function(req,res){

    res.render("./customers/new");
});
//While writing routes always write create/new route first and View route second
//When someone clicks on the view customers button on customers page below page should get displayed
app.get("/customers/view", function(req,res){
    Customer.find({}, function(err, foundCustomers){//initially i had given findById so i got error. using .find should solve the prob
        if(err)
        {
            res.send("Something went wrong while finding customers in the Db. Please check the code and try again!!")
        }else{
            res.render("./customers/view1", {customers : foundCustomers});
        }
    });
});

//when log order button is pressed in view.ejs the following route will be called
app.post("/customers/view",function(req, res){
    //extracting order details from the post request
    var name=req.body.cust_name,
        breakfast_number=req.body.breakfast_number,
        lunch_number=req.body.lunch_number;
        console.log("breakfast no:"+breakfast_number);
        console.log(name);
        console.log("lunch no:"+lunch_number);
        
    Customer.findOne({name: name }, function(err, foundCustomer){
        console.log("break cost:"+foundCustomer.breakfast_cost);
        console.log("lunch cost:"+foundCustomer.lunch_cost);
        //calculating the total cost for the particular order
        var order_cost= ((foundCustomer.breakfast_cost * breakfast_number) + (foundCustomer.lunch_cost * lunch_number));
        console.log(order_cost);
        //creating the order object
        var newOrder= {name:name, breakfast_number: breakfast_number, lunch_number: lunch_number, order_cost:order_cost};
        Order.create(newOrder, function(err, order){
            if(err){
                console.log(err);
            }else{
                console.log(order),
                //pushing the order details into the found customer and saving the info
                foundCustomer.orders.push(order);
                foundCustomer.save();
                res.redirect("/customers/view");
            }
        });
    });
});
//to find more information about a particular customer
app.get("/customers/view/:id", function(req, res){
    Customer.findById(req.params.id).populate("orders").exec(function(err, foundCustomer){
        if(err){
            console.send("Something went wrong while populating the customer order data!!");
        }else{
            res.render("./customers/show", {customer:foundCustomer});
        }
    });
});
//=====================================================================
//ADDING AUTHENTICATION ROUTES HERE
//=====================================================================

//show register form
app.get("/register", function(req,res){
    res.render("register");
});

app.post("/register", function(req,res){
   User.register(new User({username : req.query.username}), req.query.password, function(err, newUser){
       if(err){
           console.log(err);
       }
       passport.authenticate("local")(req, res, function(){
           res.redirect("/");
       });
   }) ;
});
//show login form
app.get("/login", function(req,res){
    res.render("login");
});

//login post route follows the following format-> app.post("route", middleware, callback());
app.post("/login", passport.authenticate("local", {
    successRedirect : "/",
    failureRedirect : "/login"
}) ,function(req, res){
//The callback need not do anything because whatever we want to render we are already doing it in the middleware.
});

//LOGOUT ROUTE
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/login");
});

//Checking for login status
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


//the last line will generally be the listen functionality to connect to the server.
app.listen(3000,function(){
    console.log("the application is listening on port 3000");
});


