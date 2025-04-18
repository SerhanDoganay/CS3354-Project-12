import firebase_admin
from firebase_admin import db, credentials
from credentials import Credentials, SessionToken

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
    def add_user(email_hash, password_hash):
        DatabaseManager.firebase_init()
        
        users_ref = db.reference("/users")
        
        # Check if user already exists
        if users_ref.child(email_hash).get() is not None:
            return False  # User already exists

        # Create new user
        users_ref.child(email_hash).set({
            "password_hash": password_hash
        })
        
        return True

    @staticmethod
    def user_exists(email_hash):
        DatabaseManager.firebase_init()
        return db.reference("/users").child(email_hash).get() is not None

    def get_password_hash(email_hash):
        DatabaseManager.firebase_init()
        return db.reference("/users").child(email_hash).child("password_hash").get()


    @staticmethod
    def add_session(ses):
        print(ses)
        DatabaseManager.firebase_init()

        cred = ses.get_credentials()

        sessions_ref = db.reference("/sessions")
        session_ref = sessions_ref.child(str(ses))
        session_ref.set({"raw_credentials" : { "email_hash": cred.email_hash, "password_hash": cred.password_hash, "ip_hash": cred.ip_hash }, "user_agent": ses.user_agent.decode("utf-8"), "timestamp": int.from_bytes(ses.timestamp, byteorder='little')})
    
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
        
        sessions_ref = db.reference("/sessions")
        sessions_data = sessions_ref.get()
        
        if sessions_data and isinstance(sessions_data, dict):
            for key, value in sessions_data.items():
                emaildata = sessions_ref.child(key).child("raw_credentials/email_hash").get()
                if emaildata == emailhash:
                    return True
        else:
            # print("No data or not a dict")
            return False
            
        return False