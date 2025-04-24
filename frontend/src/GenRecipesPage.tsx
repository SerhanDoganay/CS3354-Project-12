import React, { useState, useEffect } from 'react';
import { UserCircle, LogOut } from 'lucide-react'; 
import logoImage from './accountLogo.png';
import AccountSettings from './AccountSettings.tsx'; // Add this import
import CameraDetection from './CameraDetection.tsx';
import LoginPage from './LoginPage.js';
// updated

import bannerPNG from './kitchenBanner.png';

const colors = {
  background: '#DDBEA9',
  buttonBg: '#6B705C',
  buttonLight: '#D3D3C7',
};

const endpoint = 'http://127.0.0.1:8000'; 

// Add function to get cookie value
const getCookieValue = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

var recipes = [
  {
    title: 'Avocado Toast with Poached Egg',
    description: 'A quick and nutritious breakfast, featuring creamy avocado spread on whole-grain toast topped with a perfectly poached egg.',
    instructions: [
      'Bring a pot of water to boil...',
      'While the eggs are cooking, toast the bread...'
    ]
  },
  {
    title: 'One-Pot Garlic Butter Pasta',
    description: 'A simple yet flavorful pasta dish, cooked in one pot with garlic, butter, and Parmesan for a deliciously rich and easy meal.',
    instructions: [
      'In a large pot, melt butter and sauté garlic...',
      'Stir in Parmesan cheese, salt, and pepper...'
    ]
  },
  {
    title: 'Berry Smoothie Bowl',
    description: 'A refreshing blend of berries and yogurt topped with granola and fresh fruit for a perfect morning boost.',
    instructions: [
      'Blend berries, yogurt, and a splash of milk...',
      'Top with granola, fresh berries, and a drizzle of honey...'
    ]
  }
  ,
  {
    title: 'Mediterranean Quinoa Salad',
    description: 'A vibrant and healthy salad with quinoa, fresh veggies, feta cheese, and a tangy lemon vinaigrette.',
    instructions: [
      'Cook quinoa according to package instructions and let cool.',
      'In a large bowl, combine chopped cucumber, cherry tomatoes, red onion, and feta.',
      'Add quinoa and drizzle with lemon vinaigrette, then toss well to combine.'
    ]
  },
  {
    title: 'Crispy Honey Garlic Chicken',
    description: 'Crispy chicken bites coated in a sweet and savory honey garlic sauce for a delightful meal or snack.',
    instructions: [
      'Coat chicken pieces in a mixture of flour, salt, and pepper, then fry until golden.',
      'In a small saucepan, combine honey, soy sauce, and minced garlic and cook until slightly thickened.',
      'Toss the crispy chicken in the honey garlic sauce and garnish with green onions.'
    ]
  },
  {
    title: 'Crispy Honey Garlic Chicken',
    description: 'Crispy chicken bites coated in a sweet and savory honey garlic sauce for a delightful meal or snack.',
    instructions: [
      'Coat chicken pieces in a mixture of flour, salt, and pepper, then fry until golden.',
      'In a small saucepan, combine honey, soy sauce, and minced garlic and cook until slightly thickened.',
      'Toss the crispy chicken in the honey garlic sauce and garnish with green onions.'
    ]
  }
];

const GenerateRecipesPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>('');
  const [showRecipes, setShowRecipes] = useState<boolean>(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState<boolean>(false);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof recipes[0] | null>(null);
  const [favorites, setFavorites] = useState<boolean[]>(Array(recipes.length).fill(false));
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [clicked, setClicked] = useState(false);
  const [isLogoActive, setIsLogoActive] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState<typeof recipes>([]);

  // Load saved recipes from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('savedRecipes');
    if (stored) setSavedRecipes(JSON.parse(stored));
  }, []);

  // Persist saved recipes whenever they change
  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  // Add this handler
  const handleSaveRecipe = (recipe: typeof recipes[0]) => {
    if (!savedRecipes.find(r => r.title === recipe.title)) {
      setSavedRecipes(prev => [...prev, recipe]);
    }
  };
  
  // Add logout function
  const handleLogout = async () => {
    try {
      const sessionString = window.getCookieValue ? window.getCookieValue("ses") : getCookieValue("ses");
      
      const response = await fetch(`${endpoint}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ses: sessionString }),
      });
  
      if (response.ok) {
        // Redirect to login page or refresh the page
        setCurrentPage('login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleButtonClick = () => {
    setClicked(true);
    handleGenerateRecipes(); 
  };

  const handleLogoClick = () => {
    setIsLogoActive((prev) => !prev);
    setCurrentPage('settings');
    
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
      setShowRecipes(false);
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(item => item !== ingredient));
    setShowRecipes(false);
  };

  const endpoint = 'http://127.0.0.1:8000'; 

	async function getRecipe() {
    try {
      const res = await fetch(`${endpoint}/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to fetch recipe:", err);
    }
  }
  

  const handleGenerateRecipes = async () => {
    if (ingredients.length > 0) {  
      const output = await getRecipe(); 
	  recipes = []
	  const numRecipes = output.titles.length;
	  for (var i = 0; i < numRecipes; i++) {
		  recipes.push({
			  title: output.titles[i],
			  description: output.descriptions[i],
			  instructions: output.recipes[i].split('\n')
		  })
	  }
      setRecipe(output);
	  setShowRecipes(true);
      setHasGeneratedOnce(true);
    }
  };
  

  const handleNextRecipe = () => {
    setCurrentRecipeIndex((currentRecipeIndex + 1) % (recipes.length-1));
  };

  const handlePrevRecipe = () => {
    setCurrentRecipeIndex((currentRecipeIndex - 1 + recipes.length) % recipes.length);
  };

  const handleViewRecipe = (recipe: typeof recipes[0]) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecipe(null);
  };

  const toggleFavorite = (index: number) => {
    const newFavorites = [...favorites];
    newFavorites[index] = !newFavorites[index];
    setFavorites(newFavorites);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getMessage = () => {
    if (hasGeneratedOnce) {
      return ingredients.length === 0 ? 
        "Add Ingredients!" : 
        "Click Generate!";
    }
    return "Generate Again!";
  };
  const [currentPage, setCurrentPage] = useState('recipes');
  const handleProfileClick = () => {
    setCurrentPage('settings');
  };
  if (currentPage === 'settings') {
    return <AccountSettings onBack={() => setCurrentPage('recipes')} />;
  }
  if (currentPage === 'login') {
    return <LoginPage />;
  }

  return (
    <div
    className="h-screen w-screen flex flex-col items-center"
    style={{
      backgroundColor: colors.background,
      height: '100vh',
      overflowY: 'auto',
      }}
    >
    <div className="p-10 h-screen w-screen flex flex-col items-center">
    
      {/* Header with Title, Tagline, Logo and Logout Button */}
      <div className="w-full flex justify-between items-center mb-4">
        <div>
          <h1 className="text-6xl font-serif" style={{ color: '#1A1A1A' }}>BetterChefAI</h1>
          <p className="text-xl font-serif" style={{ color: '#1A1A1A', marginTop: '0.5rem' }}>
            Turning Nothing, Into Something.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-4 rounded-lg font-serif transition-all hover:scale-110 hover:shadow-md"
            style={{
              backgroundColor: colors.buttonBg,
              color: '#FFE8D6',
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          
          {/* Logo button */}
          <button
            onClick={handleLogoClick}
            className={`p-0 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-transform duration-200 ${
              isLogoActive ? 'ring-[#B7B7A4]' : 'ring-transparent'
            } hover:scale-110`}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
            }}
          >
            <img src={logoImage} alt="Logo" className="w-16 h-16" />
          </button>
        </div>
      </div>


      <div className="flex flex-col lg:flex-row w-full lg:justify-between items-start" 
      style={{ height: '50%' }}>
        {/* Ingredients List */}
        <div className="flex flex-col p-6 rounded-lg shadow-lg max-w-full lg:max-w-2/5" style={{ backgroundColor: colors.buttonBg }}>
        <h2
          className="text-2xl font-serif mb-4 text-center rounded-lg px-4 py-2"
          style={{ color: 'black', backgroundColor: '#B7B7A4'}}
        >
          Digital Pantry
        </h2>
        {/* Camera Detection Component */}
        <div className="mb-4">
          <CameraDetection 
            onIngredientsDetected={(detectedIngredients) => {
              // Add all detected ingredients
              detectedIngredients.forEach(ingredient => {
                if (!ingredients.includes(ingredient)) {
                  setIngredients(prev => [...prev, ingredient]);
                }
              });
              if (detectedIngredients.length > 0) {
                setShowRecipes(false); // Reset recipes view
                setHasGeneratedOnce(false); // Reset generation state
              }
            }} 
          />
        </div>

          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Add an ingredient"
              className="flex-1 p-2 rounded-lg border border-gray-400"
              style={{color: 'black', backgroundColor: "#FFE8D8", }}
            />
            <button onClick={handleAddIngredient} className="px-4 py-2 rounded-lg font-serif transition-all hover:scale-110 hover:shadow-md" style={{ backgroundColor: '#B7B7A4' }}>
              Add
            </button>
          </div>
          <div className="flex flex-col justify-between h-full">
            <div className="grid grid-cols-3 gap-2 overflow-y-auto mb-4" style={{ maxHeight: '300px' }}>
              {ingredients.map((ingredient, index) => (
                <button
                  key={index}
                  onClick={() => handleRemoveIngredient(ingredient)}
                  className="py-2 px-4 rounded-full font-serif transition-all hover:shadow-md text-sm max-w-[15ch] truncate whitespace-normal text-center"
                  style={{color: 'black', backgroundColor: '#FFE8D6' }}
                  title={ingredient}
                >
                  {ingredient} ✕
                </button>
              ))}
            </div>
            <button
              onClick={handleButtonClick}
              className={`py-3 rounded-lg text-lg font-serif transition-all hover:scale-110 hover:shadow-md`}
              style={{
                backgroundColor: (clicked && showRecipes) ? 'black' : '#B7B7A4',
                color: (clicked && showRecipes) ? 'white' : 'inherit',
              }}
            >
      Generate Recipes
    </button>


          </div>
        </div>

        {/* Only display carousel if recipes are generated */}
        {showRecipes ? (
          <div className="flex-grow flex justify-center items-center w-full lg:w-3/5 overflow-hidden relative" style={{ marginLeft: '1rem' }}>
            <button onClick={handlePrevRecipe} className="absolute left-[-0.01rem] p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-all z-10" 
             style={{
                backgroundColor: '#FFE8D6'
              }}>
              ◀
            </button>

            {/* Carousel Wrapper */}
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${(currentRecipeIndex - 1) * 33.33}%)`,
                width: '300%',
              }}
            >
              {recipes.map((recipe, index) => (
                <div key={index} className={`w-[28%] flex-shrink-0 px-4 transition-all duration-500 ${index === currentRecipeIndex ? 'scale-105' : 'scale-95'} ${index === currentRecipeIndex ? 'z-20' : 'z-10'}`}>
                  <RecipeCard recipe={recipe} index={index} onViewRecipe={handleViewRecipe} toggleFavorite={toggleFavorite} isFavorite={favorites[index]} onSave={handleSaveRecipe} />
                </div>
              ))}
            </div>
            
            <button onClick={handleNextRecipe} className="absolute right-[-0.01rem] p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-all z-10"
            style={{
              backgroundColor: '#FFE8D6'
            }}>
              ▶
            </button>
          </div>
        ) : (
          <div className="flex justify-center items-center w-full h-full relative pt-60">
          {/* Main Blob */}
          <div className="floating-blob"></div>
          <div className="floating-blob-support">
            <p className="text-2xl font-serif text-center" style={{ color: 'black' }}>
              {getMessage()}
            </p>
          </div>

          {/* Additional Small Blobs */}
          <div className="small-blob blob-1"></div>
          <div className="small-blob blob-2"></div>
          <div className="small-blob blob-3"></div>
          <div className="small-blob blob-4"></div>
          <div className="small-blob blob-5"></div>
          <div className="small-blob blob-6"></div>

          <style jsx>{`
            /* Main Blob */

            .floating-blob {
              background-color: #6B705C;
              width: 400px;
              height: 350px;
              display: flex;
              justify-content: center;
              align-items: center;
              position: absolute;
              animation: blob-animation 8s ease-in-out infinite;
              box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
              transform-origin: center;
            }

            .floating-blob-support {
              background-color: #FFE8D6;
              width: 300px;
              height: 250px;
              display: flex;
              justify-content: center;
              align-items: center;
              position: absolute;
              animation: blob-animation 8s ease-in-out infinite;
              box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
              transform-origin: center;
            }

            /* Main Blob Animation */
            @keyframes blob-animation {
              0%,
              100% {
                border-radius: 50% 55% 60% 55% / 55% 50% 55% 60%;
                transform: translate(0, 0) scale(1);
              }
              25% {
                border-radius: 55% 50% 60% 45% / 60% 55% 50% 45%;
                transform: translate(-5px, -10px) scale(1.03);
              }
              50% {
                border-radius: 60% 55% 50% 45% / 50% 55% 60% 55%;
                transform: translate(10px, 5px) scale(0.97);
              }
              75% {
                border-radius: 55% 60% 55% 50% / 55% 50% 60% 50%;
                transform: translate(-10px, 5px) scale(1.02);
              }
            }

            /* Small Blob Base Styles */
            .small-blob {
              position: absolute;
              background-color: #6B705C;
              opacity: 0.8;
              animation: blob-animation-variant 8s ease-in-out infinite;
            }

            /* Individual Blob Positions, Sizes, and Animation Variants */
            .blob-1 {
              width: 86px;
              height: 67px;
              top: 140%;
              left: 33%;
              animation: blob-animation-variant-1 6s ease-in-out infinite;
              border-radius: 55% 45% 60% 40% / 50% 60% 40% 55%;
            }

            .blob-2 {
              width: 98px;
              height: 138px;
              top: 93%;
              right: 66%;
              animation: blob-animation-variant-2 7s ease-in-out infinite;
              border-radius: 60% 50% 40% 60% / 55% 50% 45% 55%;
            }

            .blob-3 {
              width: 50px;
              height: 50px;
              bottom: 39%;
              left: 64%;
              animation: blob-animation-variant-3 5s ease-in-out infinite;
              border-radius: 45% 55% 60% 50% / 50% 60% 55% 45%;
            }

            .blob-4 {
              width: 176px;
              height: 90px;
              bottom: 62%;
              right: 30%;
              animation: blob-animation-variant-4 6.5s ease-in-out infinite;
              border-radius: 60% 55% 45% 50% / 55% 50% 60% 50%;
            }

            .blob-5 {
              width: 70px;
              height: 70px;
              top: 28%;
              right: 62%;
              animation: blob-animation-variant-5 7.5s ease-in-out infinite;
              border-radius: 55% 50% 60% 55% / 55% 60% 50% 50%;
            }

            .blob-6 {
              width: 70px;
              height: 98px;
              top: 119%;
              right: 31%;
              animation: blob-animation-variant-5 7.5s ease-in-out infinite;
              border-radius: 55% 50% 60% 55% / 55% 60% 50% 50%;
            }

            /* Animation Variants for Each Small Blob */
            @keyframes blob-animation-variant-1 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(10px, -5px) scale(1.1); }
            }

            @keyframes blob-animation-variant-2 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(-8px, 6px) scale(0.95); }
            }

            @keyframes blob-animation-variant-3 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(5px, -5px) scale(1.05); }
            }

            @keyframes blob-animation-variant-4 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(-10px, 5px) scale(0.9); }
            }

            @keyframes blob-animation-variant-5 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(8px, -8px) scale(1.08); }
            }
          `}</style>
        </div>
        )}
      </div>

      {/* Recipe Modal */}
      {showModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="p-8 bg-gray-100 rounded-lg shadow-lg max-w-lg w-full relative" style={{ backgroundColor: colors.buttonBg }}>
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-xl">✕</button>
            <h2 className="text-2xl font-serif mb-2 rounded-lg px-4 py-2" style={{ color: 'Black', backgroundColor: colors.buttonLight }}>Recipe For {selectedRecipe.title}</h2>
            <ol className="space-y-2 pl-5">
              {selectedRecipe.instructions.map((step, idx) => (
                <li key={idx} className="text-md font-serif" style={{ color: '#FFE8D6' }}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>

    {/* Banner */}
    {/* Banner - Positioned Outside Padding */}
    <div className="w-full mt-auto">
      <img src={bannerPNG} alt="Banner" className="w-full h-auto" style={{ objectFit: 'cover' }} />
    </div>
  </div>
  );
};

// Recipe Card Component
const RecipeCard = ({ recipe, index, onViewRecipe, toggleFavorite, isFavorite, onSave }) => (
  <div
    className="p-4 rounded-lg shadow-lg bg-gray-100 relative h-full flex flex-col justify-between"
    style={{
      backgroundColor: colors.buttonBg,
      padding: '1.5rem',
      borderRadius: '8px',
      overflow: 'hidden',
      minHeight: '450px',
    }}
  >
    <h3
      className="text-2xl font-serif mb-2 rounded-lg px-4 py-2"
      style={{ color: 'Black', backgroundColor: colors.buttonLight }}
    >
      {recipe.title}
    </h3>

    <p className="text-md font-serif mb-4" style={{ color: '#FFE8D6' }}>{recipe.description}</p>
    <div className="flex justify-between space-x-4 mt-4">
	<button 
        onClick={() => onViewRecipe(recipe)} 
        className="py-2 px-4 rounded-lg text-lg font-serif transition-all hover:shadow-md flex-grow" 
        style={{ backgroundColor: colors.buttonLight }}
      >
        View Recipe
      </button>
	  <button
        onClick={() => onSave(recipe)}
        className="py-2 px-4 rounded-lg text-lg font-serif transition-all hover:shadow-md"
        style={{ backgroundColor: '#FFE8D6' }}
      >
        Save
      </button>
    </div>

  </div>

);

export default GenerateRecipesPage;