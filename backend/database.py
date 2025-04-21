import base64
import firebase_admin
from firebase_admin import db, credentials
import hashlib
import re

class Session:
    def __init__(self, ipa, ua, ts):
        self.ip = ipa
        self.user_agent = ua
        self.timestamp = ts
        
    def __str__(self):
        m = hashlib.sha512()
    
        m.update(self.ip.encode("utf-8"))
        m.update(self.user_agent.encode("utf-8"))
        m.update(self.timestamp.to_bytes(8, "little"))
        
        return base64.b64encode(m.digest()).decode("utf-8").replace('/', '_')
        
    def __eq__(self, other):
        if isinstance(other, str):
            return self.__str__() == other
        else:
            return False
            
class User:
    def __init__(self, username_a, email_h, password_h):
        self.username = username_a
        self.email_hash = email_h
        self.password_hash = password_h
        self.active_session = None
        
    def set_session(self, ses):
        if not self.active_session is None:
            DatabaseManager.remove_session(str(self.active_session))
        self.active_session = str(ses)
        DatabaseManager.add_session(ses)
        
    @staticmethod
    def verify_email(email):
        return re.match(r"^.+@.+\..+$", email)

class DatabaseManager:
    initialized = False

    @staticmethod
    def firebase_init():
        # firebase_init should not be called by the other modules; the database manager is responsible for initializing itself
        if not DatabaseManager.initialized:
            cred = credentials.Certificate("private/firebase.json")
            firebase_admin.initialize_app(cred, { "databaseURL": "https://betterchefai-default-rtdb.firebaseio.com/" })
            DatabaseManager.initialized = True
    
    @staticmethod
    def add_user(user):
        DatabaseManager.firebase_init()
        
        # Check if user already exists
        if DatabaseManager.has_email(user.email_hash):
            return "ERROR: A user with this email already exists"
        if DatabaseManager.has_username(user.username):
            return "ERROR: A user with this username already exists"

        # Create new user
        return DatabaseManager.update_user(user)
        
    @staticmethod
    def update_user(user):
        DatabaseManager.firebase_init()
        
        users_ref = db.reference("/users")
    
        users_ref.child(user.username).set({
            "email_hash": user.email_hash,
            "password_hash": user.password_hash,
            "active_session": str(user.active_session)
        })
        
        return "Signup successful"
        
    @staticmethod
    def get_user(username):
        DatabaseManager.firebase_init()
        
        user_data = db.reference("/users").child(username)
        
        user_ret = User(username, user_data.child("email_hash").get(), user_data.child("password_hash").get())
        user_ret.active_session = user_data.child("active_session").get()
        
        return user_ret
        
    @staticmethod
    def get_username_from_session(seskey):
        DatabaseManager.firebase_init()
        
        users_ref = db.reference("/users")
        users_data = users_ref.get()
        
        if users_data and isinstance(users_data, dict):
            for key, value in users_data.items():
                sessiondata = users_ref.child(key).child("active_session").get()
                if sessiondata == seskey:
                    return key
            
        return "ERROR: No user with the associated session exists"

    @staticmethod
    def add_session(ses):
        print(ses)
        DatabaseManager.firebase_init()
        
        sessions_ref = db.reference("/sessions")
        
        sessions_ref.child(str(ses)).set({
            "ip": ses.ip,
            "user_agent": ses.user_agent,
            "timestamp": ses.timestamp
        })

    @staticmethod
    def remove_session(seskey):
        DatabaseManager.firebase_init()
        
        sessions_ref = db.reference("/sessions")
        session_ref = sessions_ref.child(seskey)
        
        if session_ref.get() is None:
            # print("Not found!")
            return False
        else:
            # print("Found!")
            session_ref.delete()
            return True
            
    @staticmethod
    def has_email(emailhash):
        DatabaseManager.firebase_init()
        
        users_ref = db.reference("/users")
        users_data = users_ref.get()
        
        if users_data and isinstance(users_data, dict):
            for key, value in users_data.items():
                emaildata = users_ref.child(key).child("email_hash").get()
                if emaildata == emailhash:
                    return True
        else:
            # print("No data or not a dict")
            return False
            
        return False

    @staticmethod
    def has_username(username):
        DatabaseManager.firebase_init()
        return db.reference("/users").child(username).get() is not None
        
    @staticmethod
    def has_session(seskey):
        DatabaseManager.firebase_init()
        return db.reference("/sessions").child(seskey).get() is not None
    
        