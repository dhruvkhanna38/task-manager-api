const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// sgMail.send({
//     to : "dhruvkhanna38@gmail.com",
//     from : "dhruvkhanna38@gmail.com", 
//     subject : "First Mail", 
//     text : "I hope this one reaches you"
// });

const sendWelcomeEmail = (email , name)=>{
    sgMail.send({
        to : email ,
        from : "dhruvkhanna38@gmail.com",
        subject: "Thanks for Joining in!!!", 
        text :`Welcome to the app, ${name}.`
    });
};


const sendCancellationEmail = (email , name)=>{
        sgMail.send({
            to: email , 
            from : "dhruvkhanna38@gmail.com",
            subject: "Thanks for using our service",
            text : `Hope to see ypu back soon ${name}`
        });
};

module.exports =  {sendWelcomeEmail, sendCancellationEmail};