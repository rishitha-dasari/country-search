import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';
import { FaSearch } from 'react-icons/fa';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [mouseOverItem, setMouseOverItem] = useState(false);

  const placeholders = useRef([
    'Search by country or capital...',
    'Find countries by capital...',
    'Type to get suggestions...',
  ]);

  const [placeholder, setPlaceholder] = useState(placeholders.current[0]);

  useEffect(() => {
    let index = 1;
    const placeholderInterval = setInterval(() => {
      setPlaceholder(placeholders.current[index]);
      index = (index + 1) % placeholders.current.length;
    }, 2000);
    return () => clearInterval(placeholderInterval);
  }, []);

  // State to store countries data fetched from JSON file
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/countries.json');  // Fetch countries from public folder
        const data = await response.json();
        setCountries(data);  // Set fetched data to state
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);
    setIsLoading(true);

    if (value.trim() !== '') {
      const filteredCountries = countries.filter(
        (country) =>
          (country.country && country.country.toLowerCase().includes(value.toLowerCase())) ||
          (country.capital && country.capital.toLowerCase().includes(value.toLowerCase()))
      );
      
      setSuggestions(filteredCountries);
    } else {
      setSuggestions([]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (mouseOverItem) return;

    if (e.key === 'ArrowDown') {
      setActiveIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prevIndex) => (prevIndex - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();  // Prevent default form submission behavior
      const selectedSuggestion = suggestions[activeIndex] || suggestions[0];  // Use first suggestion if no active index
      if (selectedSuggestion) {
        setQuery(selectedSuggestion.country);  // Set the query to the selected country's name
        setSuggestions([]);  // Clear suggestions
      } else {
        console.log('No suggestions available');
      }
    }
  };

  const handleClearInput = () => {
    setQuery('');
    setSuggestions([]);
  };

  const handleSuggestionClick = (country) => {
    setQuery(country.country);  // Set query to the clicked country's name
    setSuggestions([]);
  };

  const handleMouseEnter = (index) => {
    setMouseOverItem(true);
    setActiveIndex(index); // Highlight the hovered item
  };

  const handleMouseLeave = () => {
    setMouseOverItem(false);
    setActiveIndex(-1);
  };

  return (
    <div className="search-container">
      <div className="input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button className="clear-btn" onClick={handleClearInput}>&times;</button>
        )}
        {isLoading && <div className="loading-spinner"></div>}
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}  // Use suggestion object
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {suggestion.country} ({suggestion.capital})  {/* Show country and capital */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
