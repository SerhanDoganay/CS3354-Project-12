import unittest
import os
from vlm import VLM
from logout import AccountController

class TestVLM(unittest.TestCase):

    def test_valid_food_image(self):
        food_image_path = "test_images/good_image.jpg"
        try:
            vlm_instance = VLM(food_image_path)
            self.assertIsNotNone(vlm_instance)
            self.assertIn("recipe", vlm_instance.recipe.lower())  
            print(f"VLM instance created successfully for {food_image_path}.")
            print("Recipe:", vlm_instance.recipe)
        except ValueError as e:
            self.fail(f"Unexpected ValueError for {food_image_path}: {e}")
        except Exception as e:
            self.fail(f"Unexpected error for {food_image_path}: {e}")

    def test_non_food_image(self):
        non_food_image_path = "test_images/bad_image1.jpg"
        try:
            vlm_instance = VLM(non_food_image_path)
            self.fail(f"Expected ValueError for non-food image path: {non_food_image_path}")
        except ValueError as e:
            self.assertEqual(str(e), "The provided image does not contain food.")
            print(f"Expected error for {non_food_image_path}: {e}")
        except Exception as e:
            self.fail(f"Unexpected error for {non_food_image_path}: {e}")

    def test_invalid_image_path_empty(self):
        empty_image_path = ""
        with self.assertRaises(ValueError) as context:
            VLM(empty_image_path)
        self.assertEqual(str(context.exception), "Image path is empty or not a string.")

    def test_invalid_image_path_none(self):
        none_image_path = None
        with self.assertRaises(ValueError) as context:
            VLM(none_image_path)
        self.assertEqual(str(context.exception), "Image path is empty or not a string.")

    def test_invalid_image_path_nonexistent(self):
        nonexistent_image_path = "test_images/nonexistent_image.jpg"
        with self.assertRaises(FileNotFoundError) as context:
            VLM(nonexistent_image_path)
        self.assertEqual(str(context.exception), "The file at test_images/nonexistent_image.jpg does not exist.")

    def test_invalid_image_path_non_image_file(self):
        non_image_file_path = "test_images/non_image.txt"
        with self.assertRaises(ValueError) as context:
            VLM(non_image_file_path)
        self.assertEqual(str(context.exception), "The file at test_images/non_image.txt is not a valid image.")

    def test_invalid_image_path_corrupted(self):
        corrupted_image_path = "test_images/corrupted_image.jpg"
        with self.assertRaises(ValueError) as context:
            VLM(corrupted_image_path)
        self.assertTrue("The file at test_images/corrupted_image.jpg is not a valid image" in str(context.exception))
        
class TestLogout(unittest.TestCase):
    def test_logout(self):
        self.assertEqual(AccountController.login("fakeemail", "idcaboutthepassword"), "NULL")
        
        ses1 = AccountController.login("valid@email.com", "istilldon'tcareaboutthepassword")
        self.assertNotEqual(ses1, "NULL")
        
        self.assertFalse(AccountController.logout("fakesessionkey"))
        self.assertTrue(AccountController.logout(ses1))

if __name__ == '__main__':
    unittest.main()
