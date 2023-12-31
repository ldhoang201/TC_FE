"use client";
import React, { useEffect, useRef, useState } from "react";
import RestaurantList from "./RestaurantList";
import FoodList from "./FoodList";
import { Restaurant, Food } from "@/models/home";
import { SearchOutlined } from "@ant-design/icons";
import Filter from "./Filter";
import homeApi from "@/api/homeApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { usePathname } from "next/navigation";

type Props = {};

const Home = (props: Props) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const keyword = useSelector((state: RootState) => state.search.searchValue);
  const filterValue = useSelector((state: RootState) => state.filter.filterValue)
  const restaurantRef = useRef<Restaurant[]>([]);
  const foodRef = useRef<Food[]>([]);
  const pathName = usePathname();


  useEffect(() => { //search by keyword
    const fetchByKeyword = async () => {
      try {
        const response = await homeApi.searchByKeyword(keyword);
        setRestaurants(response.restaurant);
        setFoods(response.food);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      }
    };
    if (keyword !== '') {
      fetchByKeyword();
    }
    else {
      const fetchRestaurants = async () => {
        try {
          const response = await homeApi.getRestaurantsAll();
          setRestaurants(response.restaurants)
          restaurantRef.current = response.restaurants;
        } catch (error) {
          console.error("Failed to fetch restaurants:", error);
        }
      };
      fetchRestaurants();

      const fetchFoods = async () => {
        try {
          const response = await homeApi.getFoodAll();
          setFoods(response.foods);
          foodRef.current = response.foods;
        } catch (error) {
          console.error("Failed to fetch foods:", error);
        }
      };
      fetchFoods();
    }
  }, [keyword, pathName])


  useEffect(() => { //filter foods
    let filteredFoods: Food[] = [];
    switch (filterValue) {
      case 'all': {
        filteredFoods = foodRef.current;
        break;
      }
      case 'food': {
        filteredFoods = foodRef.current.filter(food => food.isFood);
        break;
      }
      case 'drink': {
        filteredFoods = foodRef.current.filter(food => !food.isFood);
        break;
      }
      case 'rating': {
        filteredFoods = foodRef.current.filter(food => food.rating >= 4);
        filteredFoods.sort(function (a, b) {
          return b.rating - a.rating;
        });
        break;
      }
      case 'cheap': {
        filteredFoods = foodRef.current.filter(food => food.price <= 30000);
        filteredFoods.sort(function (a, b) {
          return a.price - b.price;
        });
        break;
      }
    }
    setFoods(filteredFoods);
  }, [filterValue]);


  return (
    <div className="space-y-[10px] py-[20px] mb-[20px] bg-cover bg-[url('https://img.freepik.com/free-photo/blurred-corridor-with-chairs-tables_1203-166.jpg?w=740&t=st=1686197323~exp=1686197923~hmac=2e1b0a787055a1176f03ef10a7990945b584d6fd9d8d2ed6bec593905a190b28')]">
      <div className="flex max-w-[1200px] 2xl:max-w-[1500px]  m-auto p-[30px] flex-col shadow-md shadow-gray rounded-md max-h-[445px] min-h-[400px] space-y-[10px] bg-white">
        <h1 className="leading-none pb-[20px] border-solid border-gray border-0 border-b-[1px]">レストラン</h1>
        <RestaurantList restaurantsData={restaurants} />
      </div>
      <div className="flex max-w-[1200px] 2xl:max-w-[1500px] m-auto p-[30px] flex-col shadow-md shadow-gray rounded-md max-h-[500px] space-y-[10px] bg-white">
        <div className="flex border-solid border-gray border-0 border-b-[1px]">
          <h1 className="leading-none mr-[10px]">おすすめ料理</h1>
          <Filter
          />
        </div>

        <FoodList foodsData={foods} />
      </div>
    </div>
  );
};

export default Home;