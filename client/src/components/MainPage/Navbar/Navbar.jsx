import { Link } from "react-router-dom"
import "./Navbar.css"
import { navData } from '../../../constants/Data'
import { useState } from "react"
import forYouIcon from "../../../../../flipkart-icon-svg/for-you.svg"
import fashionIcon from "../../../../../flipkart-icon-svg/faishion.svg"
import mobileIcon from "../../../../../flipkart-icon-svg/mobiles.svg"
import electronicsIcon from "../../../../../flipkart-icon-svg/electronics.svg"
import beautyIcon from "../../../../../flipkart-icon-svg/beauty.svg"
import homeIcon from "../../../../../flipkart-icon-svg/home.svg"

const mobileNavData = [
    { text: "For You", icon: forYouIcon },
    { text: "Fashion", icon: fashionIcon },
    { text: "Mobiles", icon: mobileIcon },
    { text: "Electronics", icon: electronicsIcon },
    { text: "Beauty", icon: beautyIcon },
    { text: "Home", icon: homeIcon },
]

const Navbar = () => {
    const [activeCategory, setActiveCategory] = useState("For You")

    return (
        <>
            <div className="navbar">
                {navData.map((data) => {
                    return <Link key={data.id} to={"/categories"} style={{ all: "unset" }}>
                        <div key={data.id} className={`navbar-items ${data.className}`}>
                            <img src={data.url} alt="" />
                            <p>{data.text}</p>
                        </div>
                    </Link>
                })}
            </div>
            <nav className="mobile-category-nav" aria-label="Shop by category">
                {mobileNavData.map((item) => (
                    <Link
                        key={item.text}
                        to={item.text === "For You" ? "/" : "/categories"}
                        onClick={() => setActiveCategory(item.text)}
                        className={`mobile-category-item${activeCategory === item.text ? " active" : ""}`}
                    >
                        <span className="mobile-category-icon"><img src={item.icon} alt="" /></span>
                        <span>{item.text}</span>
                    </Link>
                ))}
            </nav>
        </>
    )
}

export default Navbar