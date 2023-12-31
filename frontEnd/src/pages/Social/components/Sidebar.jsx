import { CoffeeOutlined, HomeOutlined, ExperimentOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import {useState, useEffect} from 'react';

export default function SideBar({meals, mealplans}) {
  const navigate = useNavigate();
  const [mealNames, setMealNames] = useState([])
  const [planNames, setPlanNames] = useState([]);
  useEffect(() => {
    setMealNames([]);
    meals.map((meal, i) => {
      setMealNames((mealNames) => [...mealNames, {key: i, label: meal.recipeName}])
    })
    mealplans.map((plan, j) => {
      setPlanNames((planNames) => [...planNames, {key: j, label: plan.name}])
    })
  },[meals, mealplans])
  console.log('SAVED MEALS IN SIDEBAR: ', meals)
  return (
    <div >
      <Menu
        mode="inline"
        onClick={(item) => {
          navigate(item.key);
        }}
        items={[
          {
            label: "Home",
            key: "/Feed/home",
            icon: <HomeOutlined />,
          },
          {
            label: "Saved Meals",
            icon: <CoffeeOutlined />,
            children: mealNames
          },
          {
            label: "Saved Meal Plans",
            key: "/sns/savedMealPlans",
            icon: <ExperimentOutlined />,
            children: planNames
          },
        ]}
      />
    </div>
  );
}
