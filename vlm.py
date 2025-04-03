from google import genai
from google.genai import types
import PIL.Image
import os

API_KEY = "AIzaSyDz38dcPtjK40Dar3JqyTRpGrGhQBUfrp0"

class VLM:
    def __init__(self, image_path):
        self.image_path = image_path
        self.validate_image_path()
        self.client = genai.Client(api_key=API_KEY)
        self.image = PIL.Image.open(image_path)

        self.recipe = self.get_recipe("""Given this image, identify all the ingredients and their rough quantities. 
                                      If this image does not contain food, respond with 'This image does not contain food.'""")

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

    def get_recipe(self, prompt):
        ingredients = self.client.models.generate_content(model="gemini-2.0-flash", contents=[prompt, self.image])
        ingredients = ingredients.text

        if "This image does not contain food." in ingredients:
            raise ValueError("The provided image does not contain food.")
        
        self.chat = self.client.chats.create(model="gemini-2.0-flash")
        recipe = self.chat.send_message(f"Given these ingredients: {ingredients}, what is a recipe I can make?")

        return recipe.text
