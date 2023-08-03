
import { Card, Avatar, Collapse, message, List, Image } from 'antd';
import { LikeOutlined, DislikeOutlined, CommentOutlined, HeartOutlined, HeartFilled } from "@ant-design/icons";
import {useState, useEffect} from 'react';
import { faker } from '@faker-js/faker';
import VirtualList from 'rc-virtual-list';
import axios from 'axios';
const {Meta} = Card;

export default function MealCard({isSavedMeal, post}) {
  const postTitle = `${post.title} by ${post.username}`;
  const [heartColor, setHeartColor] = useState('white');
  const [color, setColor] = useState('grey');
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [userLiked, setUserLiked] = useState(null);
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);

  const heartProps = {
    onMouseEnter: () => {onHover(true, 'heart')},
    onMouseLeave: () => {onHover(false, 'heart')},
    onClick: savePost,
    style: {color: heartColor, position: 'absolute', top:'10px', right: '15px', fontSize: '20px'}
  }
  const messageTime = 2.5;
  const Cheesieburger = 'https://www.allrecipes.com/thmb/5JVfA7MxfTUPfRerQMdF-nGKsLY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/25473-the-perfect-basic-burger-DDMFS-4x3-56eaba3833fd4a26a82755bcd0be0c54.jpg'

  const containerHeight = 400;
  useEffect(() => {
    appendData();
    for (let item in post.meal.nutritionFacts) {
      setNutrition(nutrition => [...nutrition, `${item}: ${post.meal.nutritionFacts[item]}`]
      )
    }
    for (let item of post.meal.ingredients) {
      console.log('item ', item[0])
      setIngredients(ingredients =>
        [...ingredients, `${item[0]} ${item[1]} of ${item[2]}`]
      )
    }
    for (let step of post.meal.recipeSteps) {
      setSteps(steps =>
        [...steps, step]
      )
    }
    axios.get(`http://localhost:3000/sns/likes?postid=${post.id}`).then((response) => {
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
    })
  }, []);


  let action;
  if (isSavedMeal) {
    action = null
  } else {
    action = [
      <div key='like' onClick={()=>{like(1)}}>
        <LikeOutlined />
        <p>{likes.length}</p>
      </div>,
      <div key='dislike' onClick={()=>{like(0)}}>
        <DislikeOutlined   />
        <p>{dislikes.length}</p>
      </div>,
      <Collapse
        key='collapse'
        bordered={false}
        style={{backgroundColor:"white"}}
        items={[
         {
          key: '1',
          onMouseEnter: () => {onHover(true, 'like')},
          onMouseLeave: () => {onHover(false, 'like')},
          label: <CommentOutlined style={{color: color, position: 'absolute', top: '15%' }} />,
          showArrow: false,
          children:
            <List>
              <VirtualList
                style={{width:'300%', right: "220%", backgroundColor: 'white'}}
                itemlayout='horizontal'
                bordered='true'
                data={comments}
                height={containerHeight}
                onScroll={(onScroll)}
              >
            {(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar= {<Avatar src={Cheesieburger}/>}
                  title={<a style={{position:'relative', right:'38%'}}>{item.username}</a>}
                  description={<p style={{position: 'relative', right: '10%', textAlign: 'left'}}>{item.comment}</p>}
                />
              </List.Item>
            )}
          </VirtualList>
          </List>
          }
        ]}
      />
    ]
  }


  function appendData() {
    let newComments = [];
    for (let i = 0; i < 5; i++) {
      let username = faker.internet.userName();
      let comment = faker.word.words({count: {max: 144}});
      newComments.push({'username': username, 'comment': comment})
    }
    setComments(comments.concat(newComments));
  }

  function onScroll(e) {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === containerHeight) {
      appendData();
    }
  }

  function savePost() {
    if (!saved) {
      message.success(`${post.title} added to Saved Meals`, messageTime);
    } else {
      message.success(`${post.title} removed from Saved Meals`, messageTime);
    }
    setSaved(!saved);
  }
  function like(like) {
    if (like) {
      axios.put(`http://localhost:3000/sns/likes?postid=${post.id}&userid=${1}&like=true`).then(() => {
        message.info(`${post.title} liked!`, messageTime)
        axios.get(`http://localhost:3000/sns/likes?postid=${post.id}`).then((response) => {
          setLikes(response.data.likes);
          setDislikes(response.data.dislikes);
        })
      })
    } else {
      axios.put(`http://localhost:3000/sns/likes?postid=${post.id}&userid=${1}&like=false`).then(() => {
        message.info(`${post.title} disliked!`, messageTime)
        axios.get(`http://localhost:3000/sns/likes?postid=${post.id}`).then((response) => {
          setLikes(response.data.likes);
          setDislikes(response.data.dislikes);
        })
      })
    }
  }

 function onHover(hover, target) {
  if (hover) {
    if (target === 'like') {
      setColor('#1677ff')
    } else {
      setHeartColor('red')
    }
  } else {
    setColor('grey');
    setHeartColor('white');
  }
 }
  //format nutritional info

  return (
    <div>
      <Card
        style={{width:600, margin: '15px'}}
        cover={
          <Image fallback={Cheesieburger}/>
        }
        actions={action}
        hoverable
        >
        <Meta
          avatar={<Avatar src={Cheesieburger} />}
          title={postTitle}
          description={post.summary}
        />
        {!saved ? <HeartOutlined {...heartProps}/> : <HeartFilled {...heartProps} /> }

        <Collapse items={[
          {
            key: '1',
            label: 'Nutritional Info',
            children:
              <List
                dataSource={nutrition}
                split={false}
                renderItem={(item) => (
                  <List.Item>
                    <p>{item}</p>
                  </List.Item>
                )}
              >
              </List>
          },
          {
            key: '2',
            label: 'Ingredients',
            children:
              <List
                dataSource={ingredients}
                split={false}
                renderItem={(item) => (
                  <List.Item>
                    <p>{item}</p>
                  </List.Item>
                )}
              >
              </List>
          },
          {
            key: '3',
            label: 'Recipe/Steps',
            children:
              <List
                dataSource={steps}
                split={false}
                renderItem={(item) => (
                  <List.Item>
                    <p>{item}</p>
                  </List.Item>
                )}
              >

              </List>
          }
        ]}
        bordered={false}
        style={{backgroundColor:"white", paddingTop:'10px'}}
        />
      </Card>
    </div>
  )
}