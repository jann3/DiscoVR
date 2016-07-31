// define VR collection

VR = new Mongo.Collection('VR');

Meteor.startup(function () {
// code to run on server at startup


    // if no users
    if (Meteor.users.find().count() === 0){

      // create a test account
      // NEVER deploy without changing this !!
      Accounts.createUser({
        username: "Test",
        email: "test@test.com",
        password: "test123",
      });
    }


    if (!VR.findOne()){

      // if nothing in the database create sample dataset

      VR.insert({title: "Elite Dangerous", rift_id: "988773191157765", steam_id: "359320", category: "games", support_rift: true, support_vive: true, support_singleplayer: true, support_multiplayer: true, support_gamepad: true, support_motion: false, support_kbm: true});
      VR.insert({title: "Lucky's Tale", rift_id: "909129545868758", category: "games", support_rift: true, support_vive: false, support_singleplayer: true, support_multiplayer: false, support_gamepad: true, support_motion: false, support_kbm: false});
      VR.insert({title: "Out of Ammo", steam_id: "451840", category: "games", support_rift: false, support_vive: true, support_singleplayer: true, support_multiplayer: true, support_gamepad: false, support_motion: true, support_kbm: false});
      VR.insert({title: "Keep Talking and Nobody Explodes", rift_id: "818716001584299", steam_id: "341800", category: "games", support_rift: true, support_vive: true, support_singleplayer: false, support_multiplayer: true, support_gamepad: true, support_motion: false, support_kbm: false});
      VR.insert({title: "ADR1FT", rift_id: "905830242847405", steam_id: "300060", category: "games", support_rift: true, support_vive: true, support_singleplayer: true, support_multiplayer: false, support_gamepad: true, support_motion: false, support_kbm: false});
      VR.insert({title: "Project CARS", rift_id: "991947850898357", steam_id: "234630", category: "games", support_rift: true, support_vive: true, support_singleplayer: true, support_multiplayer: true, support_gamepad: true, support_motion: false, support_kbm: true});
      VR.insert({title: "Apollo 11 VR", rift_id: "937027946381272", steam_id: "457860", category: "games", support_rift: true, support_vive: true, support_singleplayer: true, support_multiplayer: false, support_gamepad: true, support_motion: true, support_kbm: true});
      VR.insert({title: "AltspaceVR", rift_id: "1072303152793390", steam_id: "407060", category: "games", support_rift: true, support_vive: true, support_singleplayer: false, support_multiplayer: true, support_gamepad: true, support_motion: true, support_kbm: true});
      VR.insert({title: "The Climb", rift_id: "866068943510454", category: "games", support_rift: true, support_vive: false, support_singleplayer: true, support_multiplayer: false, support_gamepad: true, support_motion: false, support_kbm: false});
      VR.insert({title: "The Town of Light", steam_id: "433100", category: "games", support_rift: true, support_vive: false, support_singleplayer: true, support_multiplayer: false, support_gamepad: true, support_motion: false, support_kbm: true});
      VR.insert({title: "Raw Data", steam_id: "436320", category: "games", support_rift: false, support_vive: true, support_singleplayer: true, support_multiplayer: true, support_gamepad: false, support_motion: true, support_kbm: false});

      console.log('inserted sample data');
      
    } // FindOne 

}); // End startup

// Deny client updates

VR.deny({
  insert() {
    return true;
  }, 
  update() {
    return true;
  }, 
  remove() {
    return true;
  },
});


// Don't let users change their profile

Meteor.users.deny({
  update() {
    return true;
  },
});


// List of all accounts methods from meteor shell command 'Meteor.server.method_handlers'
const AUTH_METHODS = [
  'login',
  'logout',
  'logoutOtherClients',
  'getNewToken',
  'removeOtherTokens',
  'configureLoginService',
  'changePassword',
  'forgotPassword',
  'resetPassword',
  'verifyEmail',
  'createUser',
];


// Only allow 2 login attempts per connection per 5 seconds
DDPRateLimiter.addRule({
  name(name) {
    return _.contains(AUTH_METHODS, name);
  },

  // Rate limit per connection ID
  connectionId() { return true; },
}, 2, 5000);



// HTTP GET from oculus for Rift

HTTP.call('GET',
          'https://www.oculus.com/experiences/rift/',
          { headers: { 'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'},
          followRedirects: false }, function(error, response){

  if (error){
    console.log(error);
  } else {

    // load response into cheerio

    var $ = cheerio.load(response.content);

    // search for Browse all

    var browseAll = $('._4my5:contains("Browse all")').html();

    console.log(browseAll);

    }
  }); // End HTTP GET

// Publish entire VR

Meteor.publish('VR', function(){
  return VR.find({});
});

Meteor.methods({
  'VR.updateFeatureSupport': function(title_id, data_support, hasSupport){
    if(Meteor.user()){

      // check params
      check(title_id, String);
      check(data_support, String);
      check(hasSupport, Boolean);

      // log method params
      console.log(title_id, data_support, hasSupport);

      // build object using data_support as key
      var update_obj = {};
      update_obj[data_support] = hasSupport;

      // if title exists
      if(VR.findOne({_id: title_id})){

        // update with object
        VR.update({_id: title_id}, { $set: update_obj});      
      }
    }
  },
});