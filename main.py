from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import Optional
from vlm import VLM
from logout import AccountController, LoginUser, PasswordValidator
from input import process_ingredient_input
import uvicorn

app = FastAPI()

class LoginData(BaseModel):
    username: str
    password: str

class Recipe(BaseModel):
    image_path: str

@app.post("/login")
def login(data: LoginData):
    account_controller = AccountController()
    if account_controller.login(data.username, data.password):
        return {"message": "Login successful"}
    else:
        return {"message": "Invalid username or password"}

@app.post("/logout")
def logout(data: LoginData):
    account_controller = AccountController()
    if account_controller.logout(data.username):
        return {"message": "Logout successful"}
    else:
        return {"message": "Logout failed"}

@app.post("/recipe")
def get_recipe(data: Recipe):
    vlm_instance = VLM(Recipe.image_path)
    return {"recipe": vlm_instance.recipe}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
