import unittest
from input import process_ingredient_input

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
