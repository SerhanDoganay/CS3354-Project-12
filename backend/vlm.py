from google import genai
from google.genai import types
import PIL.Image
import os
import re

# image --> ingredients --> recipe 
# users can also manually add more ingredients

ingredient_prompt = """Given this image, identify all the ingredients. Provide the ingredients in a list format. If this image does not contain food, respond with 'This image does not contain food.'"""
recipe_prompt = """Given a set of ingredients, list some recipes I can make. Give a short description of the food and the steps to make it. Make sure that the recipe does not contain any ingredients not provided (even if it is optional). List each recipe in the following format: "TITLE: <followed by the name of the food>", "DESCRIPTION: <followed by one or two lines of description of the food>", "RECIPE: <followed by the ingredients needed and a step-by-step list for how to prepare the food. Number and separate each step with a new line>". Do not include any text formatting in your response. Here are the ingredients"""

API_KEY = "AIzaSyDz38dcPtjK40Dar3JqyTRpGrGhQBUfrp0"
client = genai.Client(api_key=API_KEY)
class VLM:
    def __init__(self):
        self.client = client
        
    def validate_image_path(self):
        if not self.image_path or not isinstance(self.image_path, str):
            raise ValueError("Image path is empty or not a string.")
        
        if not os.path.exists(self.image_path):
            raise FileNotFoundError(f"The file at {self.image_path} does not exist.")
        
        if not os.path.isfile(self.image_path):
            raise ValueError(f"The file at {self.image_path} is not a valid image.")
        
        try:
            with open(self.image_path, 'rb') as file:
                img = PIL.Image.open(file)
                img.verify()  
        except (IOError, PIL.UnidentifiedImageError):
            raise ValueError(f"The file at {self.image_path} is not a valid image.")

    def get_ingredients(self, image_path):
        self.image_path = image_path
        self.validate_image_path()
        self.image = PIL.Image.open(image_path)

        ingredients = self.client.models.generate_content(model="gemini-2.0-flash", contents=[ingredient_prompt, self.image])
        ingredients = ingredients.text

        return ingredients

    def get_recipe_raw(self, ingredients):
        
        self.chat = self.client.chats.create(model="gemini-2.0-flash")
        recipe = self.chat.send_message(f"{recipe_prompt}: {ingredients}")
        
        titles = re.findall(r"^TITLE:\s*(.+)", recipe.text, re.MULTILINE)
        descriptions = re.findall(r"^DESCRIPTION:\s*(.+)", recipe.text, re.MULTILINE)
        recipes = re.findall(r"^RECIPE:\s*(.*?)(?=^TITLE:|\Z)", recipe.text, re.MULTILINE | re.DOTALL)
        
        return (titles, descriptions, recipes, recipe.text)
        
        
    def get_recipe(self, ingredients):
        sections = self.get_recipe_raw(ingredients)
        
        while not sections[0] or not sections[1] or not sections[2]:
            print(sections[3])
            print("Invalid format. Retrying...")
            sections = self.get_recipe_raw(ingredients)

        return sections