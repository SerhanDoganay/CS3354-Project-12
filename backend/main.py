from fastapi import FastAPI, Depends, Response, UploadFile, File, Form
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
    result = account_controller.signup(data.email, data.username, data.password, data.password2)
    return {"message": result}


@app.post("/login")
def login(data: LoginData):
    print("Login data received:", data)
    account_controller = AccountController()
    result = account_controller.login(data.username, data.password)
    return {"message": result}


@app.post("/logout")
def logout(data: LogoutData):
    account_controller = AccountController()
    if account_controller.logout(data.ses):
        return {"message": "Logout successful"}
    else:
        return {"message": "Logout failed"}

@app.post("/ingredients")
async def get_ingredients(image: UploadFile = File(...)):
    file_path = f"uploads/{image.filename}"
    
    contents = await image.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    vlm_instance = VLM()
    ingredients = vlm_instance.get_ingredients(file_path)
    return {"ingredients": ingredients}

@app.post("/recipe")
def get_recipe(data: Recipe):
    vlm_instance = VLM()
    recipe = vlm_instance.get_recipe(data.ingredients)
    print(recipe)
    return {"recipe": recipe}
    
@app.post("/validatesession")
def validate_session(data: LogoutData):
    account_controller = AccountController()
    return {"valid": account_controller.validate_session(data.ses)}

@app.get("/")
def get_headers(response: Response):
    response.headers["Content-Security-Policy"] = "default-src 'self'" # So that Firefox doesn't whine

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
