const Promise = require('promise');
const User = require('../db/models/user.js');
const Group = require('../db/models/group.js');

// ~~~~~~~~~~~~~~~~~ AUTH ~~~~~~~~~~~~~~~~~ 
// Get Current User's Id from current auth (google_id)
exports.getUserIdFromGoogleId = google_id => {
  return new Promise(function (resolve, reject) {
    if(google_id === undefined) return reject('invalid google_id');
    new User({google_id: google_id}).fetch()
    .then(user => {
      if(!!user) {
        resolve(user.get('id'));
      } else {
        reject('invalid google_id');
      }
    });
  });
};

// ~~~~~~~~~~~~~~~~~ USER ~~~~~~~~~~~~~~~~~ 
// Get all user information
exports.getAllUsers = () => {
  return new Promise(function (resolve, reject) { 
    User.fetchAll()
    .then((users) => {
      resolve(users);
    })
    .catch((err) => {
      reject('Could not retrieve users');
    });
  });
};

// Get Current User's Information from google id
exports.getCurrentUserFromGoogleId = google_id => {
  return new Promise(function (resolve, reject) {
    new User({google_id: google_id}).fetch()
      .then((user) => {
        if(!!user) {
          resolve(user);
        } else {
          reject('invalid id');
        }
      });
  });  
};

// Get Current User's Information from id
exports.getCurrentUserFromId = id => {
  return new Promise(function (resolve, reject) {
    new User({id: id}).fetch()
      .then((user) => {
        if(!!user) {
          resolve(user);
        } else {
          reject('invalid id');
        }
      });
  });  
};

// Get Current User's Token From Google Id
exports.getCurrentUserTokenFromGoogleId = google_id => {
  return new Promise(function (resolve, reject) {
    new User({google_id: google_id}).fetch()
      .then((user) => {
        if(!!user) {
          resolve(user.get('token'));
        } else {
          reject('invalid id');
        }
      });
  });  
};

// Get Current User's Token From Id
exports.getCurrentUserTokenFromId = id => {
  return new Promise(function (resolve, reject) {
    new User({id: id}).fetch()
      .then((user) => {
        if(!!user) {
          resolve(user.get('token'));
        } else {
          reject('invalid id');
        }
      });
  });  
};

// Create new User given options obj
exports.createNewUser = options => {
  return new Promise(function (resolve, reject) {
    User.forge(options).save()
    .then((user) => {
      // What is this if statement for?
      if(user.get('email') === null && user.get('google_id') === null) {
        resolve('added ' + user.get('name'));
      } else {
        resolve('Welcome, ' + user.get('first_name'));
      }
    })
    .catch((err) => {
      if(err.code === "ER_DUP_ENTRY") {
        reject('Uh-oh. It looks like that phone number is already in our system!');
      } else {
        reject('Something went wrong, please try again');
      }
    });
  });
};

// Update current User information given options obj
exports.updateCurrentUserFromId = (id, options) => {
  return new Promise(function (resolve, reject) {
    new User({id: id}).save(options, {patch: true})
    .then(user => resolve(user))
    .catch(err => reject(err));
  });
};

// Delete Current User
exports.deleteCurrentUserFromId = (id, options) => {
  return new Promise(function (resolve, reject) {
    new User({id: id}).destroy()
    .then(user => resolve('Sorry to see you go, ' + user.get('name')))
    .catch(err => reject('Could not close account'));
  });
};

// ~~~~~~~~~~~~~~~~~ GROUP ~~~~~~~~~~~~~~~~~ 
// Get all group information
exports.getAllGroups = () => {
  return new Promise(function (resolve, reject) {
    Group.fetchAll()
    .then((groups) => {
      if(groups){
        resolve(groups);
      } else {
          reject('There are no active groups');
      }
    })
    .catch((err) => {
      reject('Something went wrong, please try again')
    })
  });
};

// Get Current User's Group Information
exports.getCurrentUserGroup = (id) => {
  return new Promise(function (resolve, reject) {
    User.where({id:id}).fetch({withRelated: ['groupsBelongingTo','groupsCreated']})
    .then((groups) => {
      if(groups) {
        const data = {};
        data.groupsBelongingTo = groups.related('groupsBelongingTo');
        data.groupsCreated = groups.related('groupsCreated');
        resolve(data);
      } else {
        reject('Looks like you don\'t have any active groups');
      }
    });
  });
};

// Create a new group and set owner and group options obj
exports.createNewGroup = (id, options) => {
  options.creator_id = id;
  return new Promise(function (resolve, reject) {
    new Group(options).save()
    .then((group) => {
      if(group) {
        resolve('Group saved:' + group.get('name'));
      } else {
        reject('Could not save group');
      }
    });
  });
};

// Get specific group information
exports.getGroup = (group_id) => {
  return new Promise(function (resolve, reject) {
    Group.where({id:group_id}).getInfo()
    .then((group) => {
      if(group) {
        resolve(group);
      } else {
        reject('Could not find group: ' + group_id);
      }
    })
    .catch((err) => {
      reject('Something went wrong, please try again');
    });
  });
};

// Leave current Group
exports.leaveGroup = (id, group_id) => {
  return new Promise(function (resolve, reject) {
    Group.where({id:group_id}).removeMembers(id)
    .then((result) => {
      resolve(result);
    })
    .catch((err) => {
      reject('Could not remove from group');
    });
  });
};

// Join Group
exports.joinGroup = (id, group_id) => {
  return new Promise(function (resolve, reject) {
    Group.where({id:group_id}).acceptRequestOrInvitation(id)
    .then((result) => {
      resolve(result);
    })
    .catch((err) => {
      reject('Something went wrong, please try again')
    });
  });
};

// Send Request to join group given group id
exports.sendRequestToJoinGroup = (id, group_id) => {
  return new Promise(function (resolve, reject) {
    Group.where({id:group_id}).attachMembers(id,'requested')
    .then((result) => {
      resolve(result)
    })
    .catch((err) => {
      reject('Something went wrong, please try again');
    });
  });
};

// Accept / Reject Invitation to join group given group id
exports.acceptInvitationToJoinGroup = (id, group_id) => {
  return new Promise(function (resolve, reject) {
    Group.where({id:group_id}).acceptRequestOrInvitation(id)
    .then((result) => {
      if(result){
        resolve(result);
      } else {
        reject('Could not accept invitation');
      }
    })
    .catch((err) => {
      reject('Something went wrong, please try again');
    });
  });
};

exports.rejectInvitationToJoinGroup = (id, group_id) => {
  return new Promise(function (resolve, reject) {
    Group.where({id:group_id}).removeMembers(id)
    .then((result) => {
      resolve(result)
    })
    .catch((err) => {
      reject('Something went wrong, please try again');
    });
  });
};

// Invite a user to a group given user id
// 
// ~~~~~~~~~~~~~~Needs to send notification~~~~~~~~~~~~~~~~~~~~//
exports.sendInvitationToJoinGroup = (id, group_id) => {
  return new Promise(function (resolve, reject) {
    Group.where({id:group_id}).attachMembers(id,'invited')
    .then((result) => {
      if(result) {
        resolve(result);
      } else {
        reject('Could not get group', group_id);
      }
    });
  });
};

// Accept / Reject a user's request to join the group given user id
exports.acceptRequestToJoinGroup = (id, group_id) => {
  return new Promise(function (resolve, reject) {
    Group.where({id:group_id}).acceptRequestOrInvitation(id)
    .then((result) => {
      resolve(result)
    })
    .catch((err) => {
      reject('Something went wrong, please try again');
    });
  });
};
exports.rejectRequestToJoinGroup = (id, group_id) => {
  return new Promise(function (resolve, reject) {
    Group.where({id:group_id}).removeMembers(id)
    .then((result) => {
      resolve(result)
    })
    .catch((err) => {
      reject('Something went wrong, please try again');
    });
  });
};

// ~~~~~~~~~~~~~~~~~ EVENT ~~~~~~~~~~~~~~~~~
// Get all events for the user
exports.getCurrentUserEvents = (id) => {
  return new Promise(function (resolve, reject) {
    User.where({id:id}).getAllEvents()
    .then((events) => {
      if(events) {
        resolve(events);
      } else {
        reject('No active events');
      }
    })
    .catch((err) => {
      reject('Something went wrong, please try again');
    });
  });
};

// Get specific events given event id
exports.getEventFromId = (id, event_id) => {
  return new Promise(function (resolve, reject) {
    User.where({id:id}).getEvent(event_id)
    .then((event) => {
      resolve(event)
    })
    .catch((err) => {
      reject('Something went wrong, please try again')
    })
  })
};

// Update event details given event id
exports.updateEventFromId = (id, event_id) => {
  
};

// Delete event with given event id
exports.deleteEventFromId = (id, event_id) => {

};

// Invite User to Event given event id and user id
exports.sendInvitationToJoinEvent = (id, event_id, options) => {};

// Reject Invitation to join event given event id and user id
exports.rejectInvitationToJoinEvent = (id, event_id) => {};

// Accept Invitation to join event given event id and user id
exports.acceptInvitationToJoinEvent = (id, event_id) => {};

// Upvote an event
exports.voteForEvent = (id, event_id) => {};

// Downvote an event
exports.unvoteForEvent = (id, event_id) => {};

