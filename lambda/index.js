var rp = require('request-promise');
//require('dotenv').config();

var runner = function(event, context, callback){
    console.log("RUNNING");
    var token;
    var zapiUrl = process.env.url;
    var signInOptions = {
        method: 'POST',
        uri: process.env.URL + 'user/auth',
        body: {
            phone:process.env.PHONE_PARAM,
            password: process.env.PASS
        },
        json: true // Automatically stringifies the body to JSON
    };

    var deliveryAddressCreateOptions = {
        method: 'POST',
        uri: process.env.URL + 'address/create',
        body: {
            lat: process.env.LAT,
            lon: process.env.LON,
            address1: process.env.ADRESS1,
            address2: process.env.LADRESS2,
            city: process.env.CITY,
            state: process.env.STATE,
            zip: process.env.ZIP,
            nickname: 'IOT',
            instructions: ""
        },
        auth: {
            'bearer': null
        },
        json: true // Automatically stringifies the body to JSON
    }

    var order = {};
    order[process.env.PID] = process.env.QUANTITY;


    var orderPizzaOptions = {
        method: 'POST',
        uri: process.env.URL + 'order/create',
        body: {
            lat: process.env.LAT,
            lon: process.env.LON,
            coupon: process.env.COUPON,
            delivery_address_id: null,
            order: order,
            payment: {},
            apiVersion: 2
        },
        auth: {
            'bearer': null
        },
        json: true // Automatically stringifies the body to JSON
    };
    //sign into zapi
    rp(signInOptions)
    .then(function(res){  
    console.log("SIGN IN: ", res);      
        if(res && res.token){
            token = res.token;
            deliveryAddressCreateOptions.auth.bearer = token;
            orderPizzaOptions.auth.bearer = token;
            return rp(deliveryAddressCreateOptions);
        }
        else {
            throw new Error('Failed login attempt');
        }
    })
    .then(function(res){
        if(res && res.success && res.address && res.address.id){
            orderPizzaOptions.body.delivery_address_id = res.address.id
            return rp(orderPizzaOptions);
        }
        else{
            throw new Error('Error trying to create address');
        }
    })
    .then(function(res){
        if(res && res.success){
            console.log("CELEBRATE!!!");
        }
        else {
            throw new Error("Order placement failed");
        }
    })
    .catch(function(err){
        console.log("ERROR: ", err);
    });
}

exports.handler = runner;