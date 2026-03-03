export interface FoodItem {
    id: number;
    name: string;
    category: string;
    cuisine: string;
    price: number;
    rating: string;
    isVeg: boolean;
    image: string;
    description: string;
}

export interface RestaurantData {
    id: number;
    name: string;
    category: string;
    cuisine?: string;
    rating: string;
    deliveryTime: string;
    image: string;
    city?: string;
    menu: number[]; // array of food ids
}

export const foodData: FoodItem[] = [
    // Odia Special (Local Assets)
    { id: 1, name: "Chakuli & Matar Curry", category: "Odia Special", cuisine: "Odia", price: 90, rating: "4.8", isVeg: true, image: "/assets/food/odia-special/chakuli.png", description: "Soft rice crepes served with a savory yellow peas curry." },
    { id: 2, name: "Pakhala Bhata & Sabji", category: "Odia Special", cuisine: "Odia", price: 120, rating: "4.7", isVeg: true, image: "/assets/food/odia-special/pakhala.png", description: "Traditional fermented rice served with seasonal vegetable fry." },
    { id: 3, name: "Macha Curry", category: "Odia Special", cuisine: "Odia", price: 220, rating: "4.9", isVeg: false, image: "/assets/food/odia-special/macha.png", description: "Traditional Odia fish curry cooked in a mustard-based gravy." },
    { id: 4, name: "Chugudi Tarkari", category: "Odia Special", cuisine: "Odia", price: 250, rating: "4.8", isVeg: false, image: "/assets/food/odia-special/chugudi.png", description: "Succulent prawns cooked in a rich and spicy Odia gravy." },
    { id: 5, name: "Sujji Haluwa", category: "Odia Special", cuisine: "Odia", price: 80, rating: "4.6", isVeg: true, image: "/assets/food/odia-special/haluwa.png", description: "Sweet semolina pudding garnished with nuts and raisins." },
    { id: 6, name: "Chicken Biryani", category: "Odia Special", cuisine: "Odia", price: 240, rating: "4.7", isVeg: false, image: "/assets/food/odia-special/chicken-biryani.png", description: "Odia style chicken biryani with local spices and flavored rice." },
    { id: 7, name: "Mutton Biryani", category: "Odia Special", cuisine: "Odia", price: 320, rating: "4.9", isVeg: false, image: "/assets/food/odia-special/mutton-biryani.png", description: "Tender mutton layered with aromatic rice, Odia style." },
    { id: 8, name: "Handi Biryani", category: "Odia Special", cuisine: "Odia", price: 280, rating: "4.8", isVeg: false, image: "/assets/food/odia-special/handi-biryani.png", description: "Slow-cooked biryani in a clay pot for authentic earthy flavor." },
    { id: 9, name: "Chicken Tandoori", category: "Odia Special", cuisine: "Indian", price: 200, rating: "4.7", isVeg: false, image: "/assets/food/odia-special/tandoori.png", description: "Juicy chicken marinated in spices and grilled in a tandoor." },
    { id: 10, name: "Chicken Kebab", category: "Odia Special", cuisine: "Odia", price: 180, rating: "4.6", isVeg: false, image: "/assets/food/odia-special/kebab.png", description: "Spiced and charcoal-grilled chicken skewers." },

    // Biryani (Local & Stable Assets)
    { id: 11, name: "Hyderabadi Chicken Biryani", category: "Biryani", cuisine: "Indian", price: 320, rating: "4.9", isVeg: false, image: "/assets/food/biryani/hyderabadi.png", description: "Authentic Hyderabadi chicken dum biryani with long grain basmati rice." },
    { id: 12, name: "Lucknowi (Awadhi) Biryani", category: "Biryani", cuisine: "Indian", price: 350, rating: "4.8", isVeg: false, image: "/assets/food/biryani/lucknowi.png", description: "Fragrant and mild biryani cooked in Awadhi style with tender meat." },
    { id: 13, name: "Kolkata Biryani", category: "Biryani", cuisine: "Indian", price: 280, rating: "4.7", isVeg: false, image: "/assets/food/biryani/kolkata.png", description: "Traditional Kolkata biryani featuring the iconic potato and boiled egg." },
    { id: 14, name: "Malabar Biryani", category: "Biryani", cuisine: "South Indian", price: 260, rating: "4.8", isVeg: false, image: "/assets/food/biryani/malabar.png", description: "Flavorful biryani from the Malabar coast using Jeerakasala rice." },
    { id: 15, name: "Thalassery Biryani", category: "Biryani", cuisine: "South Indian", price: 240, rating: "4.6", isVeg: false, image: "/assets/food/biryani/thalassery.png", description: "Aromatic and moist biryani from Thalassery made with Khaima rice." },
    { id: 16, name: "Dindigul Biryani", category: "Biryani", cuisine: "South Indian", price: 220, rating: "4.5", isVeg: false, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc9?auto=format&fit=crop&q=80&w=600&h=400", description: "Tangy and peppery biryani from Dindigul using Seeraga Samba rice." },
    { id: 17, name: "Sindhi Biryani", category: "Biryani", cuisine: "Pakistani", price: 300, rating: "4.7", isVeg: false, image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=600&h=400", description: "Spicy Biryani with plums, potatoes, and a rich mix of flavors." },
    { id: 18, name: "Bombay Biryani", category: "Biryani", cuisine: "Indian", price: 250, rating: "4.6", isVeg: false, image: "/assets/food/biryani/bombay.png", description: "Mumbai style spicy biryani with potatoes and dried plums." },
    { id: 19, name: "Ambur Biryani", category: "Biryani", cuisine: "South Indian", price: 200, rating: "4.5", isVeg: false, image: "/assets/food/biryani/ambur.png", description: "Light and flavorful Tamil Nadu style biryani made with Seeraga Samba rice." },
    { id: 20, name: "Bhatkali Biryani", category: "Biryani", cuisine: "South Indian", price: 180, rating: "4.4", isVeg: false, image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=600&h=400", description: "Unique coastal Karnataka biryani with white rice and distinct spices." },

    // North Indian
    { id: 21, name: "Butter Chicken", category: "North Indian", cuisine: "Indian", price: 350, rating: "4.9", isVeg: false, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=600&h=400", description: "Creamy tomato gravy with tender roasted chicken." },
    { id: 22, name: "Paneer Butter Masala", category: "North Indian", cuisine: "Indian", price: 280, rating: "4.8", isVeg: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600&h=400", description: "Soft paneer cubes in a classic buttery tomato sauce." },
    { id: 23, name: "Dal Makhani", category: "North Indian", cuisine: "Indian", price: 220, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&q=80&w=600&h=400", description: "Slow-cooked black lentils with cream and butter." },
    { id: 24, name: "Shahi Paneer", category: "North Indian", cuisine: "Indian", price: 300, rating: "4.8", isVeg: true, image: "https://images.unsplash.com/photo-1596797038583-1c31317abb58?auto=format&fit=crop&q=80&w=600&h=400", description: "Royal cottage cheese in a rich creamy cashew gravy." },
    { id: 25, name: "Tandoori Roti", category: "North Indian", cuisine: "Indian", price: 30, rating: "4.6", isVeg: true, image: "https://images.unsplash.com/photo-1533777324565-a040eb52faf1?auto=format&fit=crop&q=80&w=600&h=400", description: "Whole wheat bread baked in a clay oven." },
    { id: 26, name: "Garlic Naan", category: "North Indian", cuisine: "Indian", price: 60, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600&h=400", description: "Soft leavened bread flavored with fresh garlic and butter." },
    { id: 27, name: "Chole Bhature", category: "North Indian", cuisine: "Indian", price: 180, rating: "4.9", isVeg: true, image: "https://images.unsplash.com/photo-1589112106528-57d6928c2901?auto=format&fit=crop&q=80&w=600&h=400", description: "Spicy chickpeas served with fluffy fried bread." },
    { id: 28, name: "Rajma Chawal", category: "North Indian", cuisine: "Indian", price: 150, rating: "4.8", isVeg: true, image: "https://images.unsplash.com/photo-1567188040759-fbba1883dbde?auto=format&fit=crop&q=80&w=600&h=400", description: "Classic kidney beans curry served with steamed basmati rice." },
    { id: 29, name: "Kadai Chicken", category: "North Indian", cuisine: "Indian", price: 320, rating: "4.7", isVeg: false, image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=600&h=400", description: "Spicy chicken with bell peppers in a wok-tossed gravy." },
    { id: 30, name: "Malai Kofta", category: "North Indian", cuisine: "Indian", price: 260, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1596797038583-34e8d356c547?auto=format&fit=crop&q=80&w=600&h=400", description: "Savoury cheese and potato dumplings in a smooth cream sauce." },

    // South Indian
    { id: 31, name: "Masala Dosa", category: "South Indian", cuisine: "South Indian", price: 120, rating: "4.8", isVeg: true, image: "https://images.unsplash.com/photo-1630383249896-419747164964?auto=format&fit=crop&q=80&w=600&h=400", description: "Crispy crepe stuffed with spiced potato mash." },
    { id: 32, name: "Plain Dosa", category: "South Indian", cuisine: "South Indian", price: 90, rating: "4.6", isVeg: true, image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=600&h=400", description: "Thin and crispy golden brown rice crepe." },
    { id: 33, name: "Idli Sambar", category: "South Indian", cuisine: "South Indian", price: 80, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600&h=400", description: "Soft steamed rice cakes served with lentil stew." },
    { id: 34, name: "Medu Vada", category: "South Indian", cuisine: "South Indian", price: 100, rating: "4.6", isVeg: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600&h=400", description: "Savory lentil donuts served with coconut chutney." },
    { id: 35, name: "Upma", category: "South Indian", cuisine: "South Indian", price: 70, rating: "4.5", isVeg: true, image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=600&h=400", description: "Savory semolina porridge with vegetables and spices." },
    { id: 36, name: "Lemon Rice", category: "South Indian", cuisine: "South Indian", price: 110, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1596797038583-1c31317abb58?auto=format&fit=crop&q=80&w=600&h=400", description: "Tangy and aromatic tempered lemon rice." },
    { id: 37, name: "Curd Rice", category: "South Indian", cuisine: "South Indian", price: 100, rating: "4.8", isVeg: true, image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&q=80&w=600&h=400", description: "Cooling tempered yogurt rice with pomegranate." },
    { id: 38, name: "Pongal", category: "South Indian", cuisine: "South Indian", price: 120, rating: "4.6", isVeg: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600&h=400", description: "Traditional rice and lentil dish tempered with pepper." },
    { id: 39, name: "Uttapam", category: "South Indian", cuisine: "South Indian", price: 110, rating: "4.5", isVeg: true, image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=600&h=400", description: "Thick savory pancake topped with daily vegetables." },
    { id: 40, name: "Coconut Chutney Dosa", category: "South Indian", cuisine: "South Indian", price: 130, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1630383249896-419747164964?auto=format&fit=crop&q=80&w=600&h=400", description: "Special dosa served with our signature coconut chutney." },

    // Chinese
    { id: 41, name: "Veg Hakka Noodles", category: "Chinese", cuisine: "Chinese", price: 160, rating: "4.5", isVeg: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600&h=400", description: "Stir-fried noodles with crisp vegetables and soya." },
    { id: 42, name: "Chicken Hakka Noodles", category: "Chinese", cuisine: "Chinese", price: 200, rating: "4.8", isVeg: false, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600&h=400", description: "Stir-fried noodles with tender chicken strips." },
    { id: 43, name: "Egg Fried Rice", category: "Chinese", cuisine: "Chinese", price: 170, rating: "4.6", isVeg: false, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600&h=400", description: "Wok-fried rice tossed with eggs and spring onions." },
    { id: 44, name: "Chicken Fried Rice", category: "Chinese", cuisine: "Chinese", price: 210, rating: "4.8", isVeg: false, image: "https://images.unsplash.com/photo-1623595110708-3694f4c9a805?auto=format&fit=crop&q=80&w=600&h=400", description: "Classic Chinese fried rice with juicy chicken pieces." },
    { id: 45, name: "Chilli Chicken", category: "Chinese", cuisine: "Chinese", price: 240, rating: "4.9", isVeg: false, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=600&h=400", description: "Spicy and tangy Indo-Chinese chicken specialty." },
    { id: 46, name: "Gobi Manchurian", category: "Chinese", cuisine: "Chinese", price: 180, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600&h=400", description: "Crispy cauliflower florets in a spicy Manchurian sauce." },
    { id: 47, name: "Paneer Chilli", category: "Chinese", cuisine: "Chinese", price: 220, rating: "4.6", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600&h=400", description: "Wok-tossed paneer with peppers in a spicy oriental sauce." },
    { id: 48, name: "Schezwan Noodles", category: "Chinese", cuisine: "Chinese", price: 190, rating: "4.5", isVeg: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600&h=400", description: "Noodles tossed in spicy homemade schezwan sauce." },
    { id: 49, name: "Veg Manchurian", category: "Chinese", cuisine: "Chinese", price: 170, rating: "4.4", isVeg: true, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600&h=400", description: "Vegetable balls in a thick, tangy Manchurian gravy." },
    { id: 50, name: "Chicken Manchurian", category: "Chinese", cuisine: "Chinese", price: 230, rating: "4.7", isVeg: false, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=600&h=400", description: "Crispy chicken in a spicy, umami Manchurian sauce." },

    // Sweets
    { id: 51, name: "Rasagola", category: "Sweets", cuisine: "Odia", price: 120, rating: "4.9", isVeg: true, image: "/assets/food/sweets/rasagola.png", description: "Traditional soft cheese balls in sugar syrup." },
    { id: 52, name: "Chhena Poda", category: "Sweets", cuisine: "Odia", price: 180, rating: "4.8", isVeg: true, image: "/assets/food/sweets/chhena-poda.png", description: "Roasted cottage cheese cake with a burnt caramelized top." },
    { id: 53, name: "Chhena Jhili", category: "Sweets", cuisine: "Odia", price: 140, rating: "4.9", isVeg: true, image: "/assets/food/sweets/chhena-jhili.png", description: "Soft cheese rings from Nimapada, fried and dipped in syrup." },
    { id: 54, name: "Rasabali", category: "Sweets", cuisine: "Odia", price: 160, rating: "4.8", isVeg: true, image: "/assets/food/sweets/rasabali.png", description: "Flat cheese patties soaked in thickened milk (rabri)." },
    { id: 55, name: "Khaja", category: "Sweets", cuisine: "Odia", price: 100, rating: "4.7", isVeg: true, image: "/assets/food/sweets/khaja.png", description: "Layered crispy pastry from Puri temple." },
    { id: 56, name: "Arisa Pitha", category: "Sweets", cuisine: "Odia", price: 110, rating: "4.6", isVeg: true, image: "/assets/food/sweets/arisa-pitha.png", description: "Traditional rice and jaggery pancake with sesame seeds." },
    { id: 57, name: "Manda Pitha", category: "Sweets", cuisine: "Odia", price: 90, rating: "4.5", isVeg: true, image: "/assets/food/sweets/manda-pitha.png", description: "Steamed rice dumplings with sweet coconut filling." },
    { id: 58, name: "Kakara Pitha", category: "Sweets", cuisine: "Odia", price: 95, rating: "4.6", isVeg: true, image: "/assets/food/sweets/kakara-pitha.png", description: "Sweet fried suji pancakes with coconut stuffing." },
    { id: 59, name: "Malpua", category: "Sweets", cuisine: "Indian", price: 130, rating: "4.7", isVeg: true, image: "/assets/food/sweets/malpua.png", description: "Sweet fried pancakes served with rabri." },
    { id: 60, name: "Rabdi", category: "Sweets", cuisine: "Indian", price: 150, rating: "4.9", isVeg: true, image: "/assets/food/sweets/rabdi.png", description: "Thickened milk dessert with saffron and nuts." },

    // Cold Drinks (added in Batch 2)

    // Beverages (Original)
    { id: 61, name: "Bela Pana", category: "Beverages", cuisine: "Odia", price: 80, rating: "4.9", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", description: "Refreshing traditional wood apple summer drink." },
    { id: 62, name: "Lassi", category: "Beverages", cuisine: "Indian", price: 90, rating: "4.8", isVeg: true, image: "https://images.unsplash.com/photo-1546173159-315724a93c97?auto=format&fit=crop&q=80&w=600&h=400", description: "Thick and creamy sweet yogurt drink." },
    { id: 63, name: "Sweet Lassi", category: "Beverages", cuisine: "Indian", price: 100, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1546173159-315724a93c97?auto=format&fit=crop&q=80&w=600&h=400", description: "Rich yogurt lassi with extra cream and nuts." },
    { id: 64, name: "Mango Shake", category: "Beverages", cuisine: "International", price: 120, rating: "4.9", isVeg: true, image: "https://images.unsplash.com/photo-1546173159-315724a93c97?auto=format&fit=crop&q=80&w=600&h=400", description: "Fresh Alphonso mangoes blended with milk." },
    { id: 65, name: "Cold Coffee", category: "Beverages", cuisine: "International", price: 140, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1546173159-315724a93c97?auto=format&fit=crop&q=80&w=600&h=400", description: "Chilled blended coffee with vanilla ice cream." },
    { id: 66, name: "Lemon Soda", category: "Beverages", cuisine: "Indian", price: 60, rating: "4.6", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", description: "Fizzy and tangy fresh lemon soda." },
    { id: 67, name: "Masala Chaas", category: "Beverages", cuisine: "Indian", price: 50, rating: "4.8", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", description: "Spiced buttermilk with cumin and coriander." },
    { id: 68, name: "Tender Coconut Water", category: "Beverages", cuisine: "Natural", price: 70, rating: "4.9", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", description: "Pure and healthy natural coconut water." },
    { id: 69, name: "Chocolate Shake", category: "Beverages", cuisine: "International", price: 150, rating: "4.8", isVeg: true, image: "https://images.unsplash.com/photo-1546173159-315724a93c97?auto=format&fit=crop&q=80&w=600&h=400", description: "Rich and creamy Belgian chocolate milkshake." },
    { id: 70, name: "Mint Mojito", category: "Beverages", cuisine: "International", price: 130, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", description: "Refreshing mint and lime mocktail." },

    // Fast Food
    { id: 71, name: "Chicken Burger", category: "Fast Food", cuisine: "Western", price: 160, rating: "4.8", isVeg: false, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600&h=400", description: "Juicy chicken patty with lettuce and cheese." },
    { id: 72, name: "Veg Burger", category: "Fast Food", cuisine: "Western", price: 120, rating: "4.6", isVeg: true, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=600&h=400", description: "Crispy vegetable patty with fresh toppings." },
    { id: 73, name: "Chicken Roll", category: "Fast Food", cuisine: "Kolkata Style", price: 140, rating: "4.7", isVeg: false, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600&h=400", description: "Spiced chicken kebabs rolled in a paratha." },
    { id: 74, name: "Paneer Roll", category: "Fast Food", cuisine: "Kolkata Style", price: 130, rating: "4.6", isVeg: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600&h=400", description: "Soft paneer cubes with onions in a paratha roll." },
    { id: 75, name: "Chicken Momos", category: "Fast Food", cuisine: "Tibetan", price: 150, rating: "4.9", isVeg: false, image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b?auto=format&fit=crop&q=80&w=600&h=400", description: "Steamed dumplings filled with juicy minced chicken." },
    { id: 76, name: "Veg Momos", category: "Fast Food", cuisine: "Tibetan", price: 120, rating: "4.7", isVeg: true, image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b?auto=format&fit=crop&q=80&w=600&h=400", description: "Healthy steamed vegetable dumplings." },
    { id: 77, name: "French Fries", category: "Fast Food", cuisine: "Western", price: 100, rating: "4.5", isVeg: true, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600&h=400", description: "Classic salted crispy potato fries." },
    { id: 78, name: "Cheese Sandwich", category: "Fast Food", cuisine: "Western", price: 110, rating: "4.4", isVeg: true, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=600&h=400", description: "Grilled sandwich with melting cheese and butter." },
    { id: 79, name: "Chicken Pizza", category: "Fast Food", cuisine: "Italian", price: 280, rating: "4.8", isVeg: false, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600&h=400", description: "Loaded with chicken chunks and fresh mozzarella." },
    { id: 80, name: "Veg Pizza", category: "Fast Food", cuisine: "Italian", price: 220, rating: "4.6", isVeg: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600&h=400", description: "Assorted vegetables on a cheese-burst base." },

    // Cold Drinks (added in Batch 2)
    { id: 81, name: "Coca Cola", category: "Cold Drinks", cuisine: "Cold Drinks", price: 40, rating: "4.9", isVeg: true, image: "/assets/food/cold-drinks/coca-cola.png", description: "Classic carbonated soft drink served chilled." },
    { id: 82, name: "Pepsi", category: "Cold Drinks", cuisine: "Cold Drinks", price: 40, rating: "4.8", isVeg: true, image: "/assets/food/cold-drinks/pepsi.png", description: "Refreshing cola drink with a bold taste." },
    { id: 83, name: "Sprite", category: "Cold Drinks", cuisine: "Cold Drinks", price: 40, rating: "4.7", isVeg: true, image: "/assets/food/cold-drinks/sprite.png", description: "Crisp and clear lemon-lime flavored soft drink." },
    { id: 84, name: "Thums Up", category: "Cold Drinks", cuisine: "Cold Drinks", price: 45, rating: "4.9", isVeg: true, image: "/assets/food/cold-drinks/thums-up.png", description: "Strong and spicy Indian cola drink." },
    { id: 85, name: "Fanta", category: "Cold Drinks", cuisine: "Cold Drinks", price: 40, rating: "4.6", isVeg: true, image: "/assets/food/cold-drinks/fanta.png", description: "Vibrant orange flavored sparkling drink." },
    { id: 86, name: "Mountain Dew", category: "Cold Drinks", cuisine: "Cold Drinks", price: 45, rating: "4.7", isVeg: true, image: "/assets/food/cold-drinks/mountain-dew.png", description: "High-energy citrus flavored carbonated drink." },
    { id: 87, name: "Limca", category: "Cold Drinks", cuisine: "Cold Drinks", price: 40, rating: "4.6", isVeg: true, image: "/assets/food/cold-drinks/limca.png", description: "Light and refreshing lime and lemony drink." },
    { id: 88, name: "7UP", category: "Cold Drinks", cuisine: "Cold Drinks", price: 40, rating: "4.7", isVeg: true, image: "/assets/food/cold-drinks/7up.png", description: "Natural lemon and lime flavored drink with no caffeine." },
    { id: 89, name: "Mirinda", category: "Cold Drinks", cuisine: "Cold Drinks", price: 40, rating: "4.5", isVeg: true, image: "/assets/food/cold-drinks/mirinda.png", description: "Sweet and fruity orange carbonated drink." },
    { id: 90, name: "Appy Fizz", category: "Cold Drinks", cuisine: "Cold Drinks", price: 30, rating: "4.8", isVeg: true, image: "/assets/food/cold-drinks/appy-fizz.png", description: "Bubbly apple juice based sparkling drink." },

    // Ice Cream
    { id: 91, name: "Vanilla Ice Cream", category: "Ice Cream", cuisine: "Dessert", price: 80, rating: "4.7", isVeg: true, image: "/assets/food/ice-cream/vanilla-ice-cream.png", description: "Classic creamy vanilla bean ice cream." },
    { id: 92, name: "Chocolate Ice Cream", category: "Ice Cream", cuisine: "Dessert", price: 100, rating: "4.9", isVeg: true, image: "/assets/food/ice-cream/chocolate-ice-cream.png", description: "Rich and decadent Belgian chocolate ice cream." },
    { id: 93, name: "Strawberry Ice Cream", category: "Ice Cream", cuisine: "Dessert", price: 90, rating: "4.6", isVeg: true, image: "/assets/food/ice-cream/strawberry-ice-cream.png", description: "Fresh strawberry swirled creamy dessert." },
    { id: 94, name: "Butterscotch Ice Cream", category: "Ice Cream", cuisine: "Dessert", price: 110, rating: "4.8", isVeg: true, image: "/assets/food/ice-cream/butterscotch-ice-cream.png", description: "Crunchy butterscotch bits in a golden syrup cream." },
    { id: 95, name: "Black Currant Ice Cream", category: "Ice Cream", cuisine: "Dessert", price: 120, rating: "4.7", isVeg: true, image: "/assets/food/ice-cream/black-currant-ice-cream.png", description: "Exotic black currant fruit flavored purple cream." },
    { id: 96, name: "Mango Ice Cream", category: "Ice Cream", cuisine: "Dessert", price: 100, rating: "4.9", isVeg: true, image: "/assets/food/ice-cream/mango-ice-cream.png", description: "Creamy seasonal Alphonso mango dessert." },
    { id: 97, name: "Chocolate Chip Ice Cream", category: "Ice Cream", cuisine: "Dessert", price: 110, rating: "4.8", isVeg: true, image: "/assets/food/ice-cream/chocolate-chip-ice-cream.png", description: "Vanilla cream loaded with dark chocolate chips." },
    { id: 98, name: "Kesar Pista Ice Cream", category: "Ice Cream", cuisine: "Dessert", price: 130, rating: "4.9", isVeg: true, image: "/assets/food/ice-cream/kesar-pista-ice-cream.png", description: "Traditional Indian saffron and pistachio nut ice cream." },
    { id: 99, name: "Oreo Ice Cream", category: "Ice Cream", cuisine: "Dessert", price: 140, rating: "4.8", isVeg: true, image: "/assets/food/ice-cream/oreo-ice-cream.png", description: "Cookies and cream style dessert with Oreo bits." },
    { id: 100, name: "Tutti Frutti Ice Cream", category: "Ice Cream", cuisine: "Dessert", price: 85, rating: "4.6", isVeg: true, image: "/assets/food/ice-cream/tutti-frutti-ice-cream.png", description: "Assorted candied fruit bits in a colorful creamy base." },

];

export const restaurantData: RestaurantData[] = [
    {
        id: 1,
        name: "The Odia Kitchen",
        category: "Odia Special",
        rating: "4.9",
        deliveryTime: "30-40 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Odia Special restaurant")}`,
        menu: [1, 2, 3, 4, 5, 26, 27, 35]
    },
    {
        id: 2,
        name: "Biryani Blues",
        category: "Biryani",
        rating: "4.7",
        deliveryTime: "25-35 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Biryani restaurant")}`,
        menu: [6, 7, 8, 9, 10, 31, 33]
    },
    {
        id: 3,
        name: "Peshawari Darbar",
        category: "North Indian",
        rating: "4.8",
        deliveryTime: "35-45 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("North Indian restaurant")}`,
        city: "Delhi",
        menu: [11, 12, 13, 14, 15, 32]
    },
    {
        id: 12,
        name: "idli & Dosa Express",
        category: "South Indian",
        rating: "4.5",
        deliveryTime: "15-25 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("South Indian restaurant")}`,
        menu: [16, 17, 18, 19, 33]
    },
    {
        id: 13,
        name: "Mandala Kitchen",
        category: "Odia Special",
        rating: "4.7",
        deliveryTime: "30-45 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Odia Special restaurant")}`,
        menu: [3, 4, 5, 27]
    },
    {
        id: 14,
        name: "Golden Wok Chinese",
        category: "Chinese",
        rating: "4.4",
        deliveryTime: "25-35 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Chinese restaurant")}`,
        menu: [21, 23, 25, 34]
    },
    {
        id: 15,
        name: "Mughlai Junction",
        category: "North Indian",
        rating: "4.8",
        deliveryTime: "30-40 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Mughlai restaurant")}`,
        menu: [21, 29]
    },
    {
        id: 16,
        name: "Shahi Darbar",
        category: "North Indian",
        rating: "4.7",
        deliveryTime: "35-45 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Shahi Paneer")}`,
        menu: [22, 24]
    },
    {
        id: 17,
        name: "Punjab Grill Kitchen",
        category: "North Indian",
        rating: "4.9",
        deliveryTime: "40-50 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Punjabi food")}`,
        menu: [23, 30]
    },
    {
        id: 18,
        name: "Royal Tandoor",
        category: "North Indian",
        rating: "4.6",
        deliveryTime: "25-35 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Tandoori")}`,
        menu: [24, 25]
    },
    {
        id: 19,
        name: "Tandoor Express",
        category: "North Indian",
        rating: "4.5",
        deliveryTime: "20-30 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Tandoor oven")}`,
        menu: [25, 26]
    },
    {
        id: 20,
        name: "Spice Villa",
        category: "North Indian",
        rating: "4.7",
        deliveryTime: "30-40 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Spice Villa")}`,
        menu: [26, 28]
    },
    {
        id: 21,
        name: "Delhi Zaika",
        category: "North Indian",
        rating: "4.8",
        deliveryTime: "35-45 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Old Delhi food")}`,
        menu: [27, 21]
    },
    {
        id: 22,
        name: "North Feast",
        category: "North Indian",
        rating: "4.6",
        deliveryTime: "25-35 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("North Indian feast")}`,
        menu: [28, 23]
    },
    {
        id: 23,
        name: "Nawabi Kitchen",
        category: "North Indian",
        rating: "4.7",
        deliveryTime: "30-40 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Nawabi food")}`,
        menu: [29, 22]
    },
    {
        id: 24,
        name: "Urban Dhaba",
        category: "North Indian",
        rating: "4.8",
        deliveryTime: "35-45 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Urban Dhaba")}`,
        menu: [30, 27]
    },
    {
        id: 25,
        name: "Udupi Grand",
        category: "South Indian",
        rating: "4.9",
        deliveryTime: "15-25 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Udupi food")}`,
        menu: [31, 33]
    },
    {
        id: 26,
        name: "Madras Cafe",
        category: "South Indian",
        rating: "4.8",
        deliveryTime: "20-30 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Madras cafe")}`,
        menu: [32, 34]
    },
    {
        id: 27,
        name: "South Spice",
        category: "South Indian",
        rating: "4.7",
        deliveryTime: "25-35 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("South Indian spices")}`,
        menu: [33, 35]
    },
    {
        id: 28,
        name: "Udupi Bhavan",
        category: "South Indian",
        rating: "4.6",
        deliveryTime: "15-25 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Udupi Bhavan")}`,
        menu: [34, 36]
    },
    {
        id: 29,
        name: "Anna Kitchen",
        category: "South Indian",
        rating: "4.7",
        deliveryTime: "20-30 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Home style South Indian")}`,
        menu: [35, 37]
    },
    {
        id: 30,
        name: "Chennai Express",
        category: "South Indian",
        rating: "4.8",
        deliveryTime: "25-35 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Chennai food")}`,
        menu: [36, 38]
    },
    {
        id: 31,
        name: "Tamil Treats",
        category: "South Indian",
        rating: "4.6",
        deliveryTime: "20-30 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Tamil food")}`,
        menu: [37, 39]
    },
    {
        id: 32,
        name: "South Delight",
        category: "South Indian",
        rating: "4.7",
        deliveryTime: "25-35 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("South Indian delight")}`,
        menu: [38, 40]
    },
    {
        id: 33,
        name: "Dosa Plaza",
        category: "South Indian",
        rating: "4.8",
        deliveryTime: "15-25 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Dosa variety")}`,
        menu: [39, 31]
    },
    {
        id: 34,
        name: "Udupi Classic",
        category: "South Indian",
        rating: "4.9",
        deliveryTime: "20-30 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Classic Udupi")}`,
        menu: [40, 32]
    },
    {
        id: 35,
        name: "Chinese Wok",
        category: "Chinese",
        rating: "4.5",
        deliveryTime: "25-35 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Chinese wok")}`,
        menu: [41, 46]
    },
    {
        id: 36,
        name: "Dragon Bowl",
        category: "Chinese",
        rating: "4.8",
        deliveryTime: "30-40 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Dragon bowl Chinese")}`,
        menu: [42, 47]
    },
    {
        id: 37,
        name: "China Town",
        category: "Chinese",
        rating: "4.6",
        deliveryTime: "35-45 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("China Town")}`,
        menu: [43, 48]
    },
    {
        id: 38,
        name: "Red Chilli Kitchen",
        category: "Chinese",
        rating: "4.8",
        deliveryTime: "30-40 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Spicy Chinese food")}`,
        menu: [44, 49]
    },
    {
        id: 39,
        name: "Wok Express",
        category: "Chinese",
        rating: "4.9",
        deliveryTime: "25-35 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Chinese food express")}`,
        menu: [45, 50]
    },
    {
        id: 40,
        name: "Spice China",
        category: "Chinese",
        rating: "4.7",
        deliveryTime: "30-40 mins",
        image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Spices of China")}`,
        menu: [46, 41]
    },
    { id: 41, name: "Asian Hub", category: "Chinese", rating: "4.6", deliveryTime: "30-40 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Asian food")}`, menu: [47, 42] },
    { id: 42, name: "Hot Wok", category: "Chinese", rating: "4.5", deliveryTime: "25-35 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Hot wok")}`, menu: [48, 43] },
    { id: 43, name: "Pahala Sweets", category: "Sweets", rating: "4.9", deliveryTime: "10-15 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Indian sweets")}`, menu: [51, 52] },
    { id: 44, name: "Jagannath Bhog", category: "Sweets", rating: "4.8", deliveryTime: "15-20 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Prasadam")}`, menu: [53, 54] },
    { id: 45, name: "Sweet Bengal", category: "Sweets", rating: "4.7", deliveryTime: "20-25 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Bengali sweets")}`, menu: [55, 56] },
    { id: 46, name: "Mishra Sweets", category: "Sweets", rating: "4.6", deliveryTime: "10-15 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Traditional sweets")}`, menu: [57, 58] },
    { id: 47, name: "Royal Mithai", category: "Sweets", rating: "4.8", deliveryTime: "15-20 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Mithai")}`, menu: [59, 60] },
    { id: 48, name: "Juice Factory", category: "Beverages", rating: "4.9", deliveryTime: "10-15 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Fresh juice")}`, menu: [61, 64, 68] },
    { id: 49, name: "Lassi Shop", category: "Beverages", rating: "4.8", deliveryTime: "10-15 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Lassi")}`, menu: [62, 63] },
    { id: 50, name: "Coffee Bond", category: "Beverages", rating: "4.7", deliveryTime: "15-20 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Coffee shop")}`, menu: [65, 70] },
    { id: 51, name: "Soda Hub", category: "Beverages", rating: "4.6", deliveryTime: "10-15 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Soda")}`, menu: [66, 67] },
    { id: 52, name: "Shake It Off", category: "Beverages", rating: "4.8", deliveryTime: "20-25 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Milkshake")}`, menu: [69, 64] },
    { id: 53, name: "Burger King Hut", category: "Fast Food", rating: "4.5", deliveryTime: "20-30 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Burger shop")}`, menu: [71, 72, 77] },
    { id: 54, name: "Roll Mania", category: "Fast Food", rating: "4.7", deliveryTime: "15-25 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Kathi roll")}`, menu: [73, 74] },
    { id: 55, name: "Momo House", category: "Fast Food", rating: "4.9", deliveryTime: "10-20 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Momos")}`, menu: [75, 76] },
    { id: 56, name: "Pizza Hut Lite", category: "Fast Food", rating: "4.6", deliveryTime: "25-35 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Pizza restaurant")}`, menu: [79, 80] },
    { id: 57, name: "Sandwich Hub", category: "Fast Food", rating: "4.4", deliveryTime: "15-20 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Sandwich shop")}`, menu: [78, 72] },
    { id: 58, name: "Fry Corner", category: "Fast Food", rating: "4.5", deliveryTime: "10-15 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("French fries")}`, menu: [77, 71] },
    { id: 59, name: "Dino's Pizza", category: "Fast Food", rating: "4.7", deliveryTime: "25-35 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Italian pizza")}`, menu: [80, 75] },
    { id: 60, name: "Urban Burger", category: "Fast Food", rating: "4.8", deliveryTime: "20-30 min", image: `https://images.unsplash.com/featured/600x400/?${encodeURIComponent("Premium burger")}`, menu: [71, 79] },

    // Cold Drinks Brands
    { id: 61, name: "Cool Drinks Corner", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.9", deliveryTime: "10-15 min", category: "Cold Drinks", cuisine: "Beverages", menu: [81] },
    { id: 62, name: "Refresh Point", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.8", deliveryTime: "10-15 min", category: "Cold Drinks", cuisine: "Beverages", menu: [82] },
    { id: 63, name: "Chill Zone Cafe", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.7", deliveryTime: "15-20 min", category: "Cold Drinks", cuisine: "Beverages", menu: [83] },
    { id: 64, name: "Desi Soda Hub", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.9", deliveryTime: "10-15 min", category: "Cold Drinks", cuisine: "Beverages", menu: [84] },
    { id: 65, name: "Orange Drink Stall", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.6", deliveryTime: "15-20 min", category: "Cold Drinks", cuisine: "Beverages", menu: [85] },
    { id: 66, name: "Energy Drinks Point", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.7", deliveryTime: "15-20 min", category: "Cold Drinks", cuisine: "Beverages", menu: [86] },
    { id: 67, name: "Lemon Soda House", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.6", deliveryTime: "10-15 min", category: "Cold Drinks", cuisine: "Beverages", menu: [87] },
    { id: 68, name: "Fresh Sip Corner", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.7", deliveryTime: "10-15 min", category: "Cold Drinks", cuisine: "Beverages", menu: [88] },
    { id: 69, name: "Cool Beverage Shop", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.5", deliveryTime: "15-20 min", category: "Cold Drinks", cuisine: "Beverages", menu: [89] },
    { id: 70, name: "Fizzy Drinks Bar", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.8", deliveryTime: "10-15 min", category: "Cold Drinks", cuisine: "Beverages", menu: [90] },

    // Ice Cream Brands
    { id: 71, name: "Kwality Walls", image: "https://images.unsplash.com/photo-1570197788417-0e82375c9391?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.9", deliveryTime: "15-20 min", category: "Ice Cream", cuisine: "Ice Cream", menu: [91, 96] },
    { id: 72, name: "Amul Ice Cream", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.8", deliveryTime: "15-20 min", category: "Ice Cream", cuisine: "Ice Cream", menu: [92, 95] },
    { id: 73, name: "Cream Stone", image: "https://images.unsplash.com/photo-1560008511-11c63416e52d?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.7", deliveryTime: "20-25 min", category: "Ice Cream", cuisine: "Ice Cream", menu: [93, 99] },
    { id: 74, name: "Baskin Robbins", image: "https://images.unsplash.com/photo-1505394033343-431d4546ae1a?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.9", deliveryTime: "15-20 min", category: "Ice Cream", cuisine: "Ice Cream", menu: [94, 97] },
    { id: 75, name: "Naturals Ice Cream", image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.9", deliveryTime: "20-25 min", category: "Ice Cream", cuisine: "Ice Cream", menu: [98] },
    { id: 76, name: "Ideal Ice Cream", image: "https://images.unsplash.com/photo-1560008511-11c63416e52d?auto=format&fit=crop&q=80&w=600&h=400", rating: "4.8", deliveryTime: "20-25 min", category: "Ice Cream", cuisine: "Ice Cream", menu: [100] }
];
