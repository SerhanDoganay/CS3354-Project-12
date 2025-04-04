import unittest
import os
from vlm import VLM
from logout import AccountController, LoginUser, PasswordValidator
from input import process_ingredient_input

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

class TestLogin(unittest.TestCase):    
    def test_login_TC1_valid(self):
        self.assertEqual(LoginUser.validate_login_id("newuser@hmail.com"), "Login Successful")

    def test_login_TC2_too_short(self):
        self.assertEqual(LoginUser.validate_login_id("x@y.c"), "Login id does not satisfy length requirement")

    def test_login_TC3_existing(self):
        self.assertEqual(LoginUser.validate_login_id("olduser@hmail.com"), "Login id exists !!!")

    def test_login_TC4_space_in_email(self):
        self.assertEqual(LoginUser.validate_login_id("new user@hmail.com"), "Login id has space/control/special character in it")

    def test_login_TC5_slash_in_email(self):
        self.assertEqual(LoginUser.validate_login_id("some/user@hmail.com"), "Login id has space/control/special character in it")

class TestPasswordValidator(unittest.TestCase):
    def test_password_valid(self):
        result = PasswordValidator.validate_password("abc12345")
        self.assertEqual(result, "Password OK")

    def test_password_too_short(self):
        result = PasswordValidator.validate_password("ab12")
        self.assertEqual(result, "Password must be at least 8 characters in length")

    def test_password_space(self):
        result = PasswordValidator.validate_password("abc 1234")
        self.assertEqual(result, "Password cannot contain spaces")

    def test_password_control_char(self):
        pwd_with_control = "abc123" + "\t" + "xy"
        result = PasswordValidator.validate_password(pwd_with_control)
        self.assertEqual(result, "Password cannot contain control characters")
        
    def test_password_exceptional(self):
        result = PasswordValidator.validate_password(5)
        self.assertEqual(result, "Password must be a string")


class TestAccountController(unittest.TestCase):
    def setUp(self):
        AccountController.session_list.clear()

    def test_login_logout_flow(self):
        session_1 = AccountController.login("notAValidFormat", "abcd1234", "abcd1234")
        self.assertEqual(session_1, "NULL")

        session_2 = AccountController.login("valid@email.com", "ab", "ab")
        self.assertEqual(session_2, "NULL")

        session_3 = AccountController.login("valid@testing.com", "abcd1234", "abcd1234")
        self.assertNotEqual(session_3, "NULL")

        self.assertFalse(AccountController.logout("fake_token")) # Invalid case
        
        self.assertFalse(AccountController.logout(5)) # Exceptional case

        self.assertTrue(AccountController.logout(session_3)) # Valid case

class TestIngredientProcessor(unittest.TestCase):

    def test_valid_input_comma_separated(self):
        result = process_ingredient_input("onion, garlic, tomato")
        self.assertEqual(result, ["onion", "garlic", "tomato"])

    def test_valid_input_space_separated(self):
        result = process_ingredient_input("onion garlic tomato")
        self.assertEqual(result, ["onion", "garlic", "tomato"])

    def test_valid_input_mixed_separators(self):
        result = process_ingredient_input("onion, garlic\ntomato")
        self.assertEqual(result, ["onion", "garlic", "tomato"])

    def test_whitespace_only_input(self):
        result = process_ingredient_input("   \n  \t")
        self.assertEqual(result, "Error: No ingredients provided.")

    def test_empty_input(self):
        result = process_ingredient_input("")
        self.assertEqual(result, "Error: No ingredients provided.")

    def test_input_with_extra_spaces_and_commas(self):
        result = process_ingredient_input(" tomato , , onion , garlic  ")
        self.assertEqual(result, ["tomato", "onion", "garlic"])

    def test_symbols_and_special_chars(self):
        result = process_ingredient_input("@@@, $$$, %%%")
        self.assertEqual(result, ["@@@", "$$$", "%%%"])

if __name__ == '__main__':
    unittest.main()