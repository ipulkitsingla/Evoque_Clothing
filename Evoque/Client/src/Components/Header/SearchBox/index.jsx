import { Button } from "@mui/material";
import { FaSearch } from "react-icons/fa";
const SearchBox = () => {
    return (
        <div className="header-search ml-3 mr-3">
                        <input type="text" name="" id="" placeholder="What are you Looking For" />
                        <Button><FaSearch /></Button>
                    </div>
    )
}

export default SearchBox;