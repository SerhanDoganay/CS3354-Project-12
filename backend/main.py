from fastapi import FastAPI, Depends, Response
from pydantic import BaseModel
from typing import Optional
from vlm import VLM
from logout import AccountController, LoginUser, PasswordValidator
from input import process_ingredient_input
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for more control
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginData(BaseModel):
    username: str
    password: str

class LogoutData(BaseModel):
    ses: str

class Ingredients(BaseModel):
    image_path: str

class Recipe(BaseModel):
    ingredients: list[str]
class SignupData(BaseModel):
    email: str
    username: str
    password: str
    password2: str

@app.post("/signup")
def signup(data: SignupData):
    print("Signup data received:", data)
    account_controller = AccountController()
    result = account_controller.signup(data.email, data.password, data.password2)
    if result != "NULL":
        return {"message": "Signup successful"}
    return {"message": "Signup failed"}


@app.post("/login")
def login(data: LoginData):
    print("Login data received:", data)
    account_controller = AccountController()
    if account_controller.login(data.username, data.password) != "NULL":
        return {"message": "Login successful"}
    return {"message": "Invalid username or password"}


@app.post("/logout")
def logout(data: LogoutData):
    account_controller = AccountController()
    if account_controller.logout(data.ses):
        return {"message": "Logout successful"}
    else:
        return {"message": "Logout failed"}

@app.post("/ingredients")
def get_ingredients(data: Recipe):
    vlm_instance = VLM()
    ingredients = vlm_instance.get_ingredients(data.image_path)
    return {"ingredients": ingredients}

@app.post("/recipe")
def get_recipe(data: Recipe):
    vlm_instance = VLM()
    recipe = vlm_instance.get_recipe(data.ingredients)
    return {"recipe": recipe}

@app.get("/")
def get_headers(response: Response):
    response.headers["Content-Security-Policy"] = "default-src 'self'" # So that Firefox doesn't whine

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
