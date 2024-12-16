import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {PieChart} from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOI_CAP_NHAT = 'MOI_CAP_NHAT';
const QUAN_TRONG = 'QUAN_TRONG';
const TAI_LIEU = 'TAI_LIEU';

const MainScreen = ({navigation}) => {
  const [avatar, setAvatar] = useState(
    'https://www.gravatar.com/avatar/f406aa83aaa03e35b03dd4ed6773e558a4f8995dc3da3fa3c9cc50a807c195bc?d=identicon',
  );
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(MOI_CAP_NHAT);
  const [userName, setUserName] = useState('Người dùng');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://172.20.10.2:3001/api/projects', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setProjects(data);
      
      if (data.length > 0) {
        setSelectedProjectId(data[0]._id);
        handleProjectClick(data[0]._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksByProject = async projectId => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(
        `http://172.20.10.2:3001/api/projects/${projectId}/tasks`,
        {
          method: 'GET',
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      const result = await response.json();
      setTasks(result);
    } catch (error) {
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async projectId => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://172.20.10.2:3001/api/projects/${projectId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        fetchProjects();
      } else {
        console.error('Xóa thất bại');
      }
    } catch (error) {
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = async projectId => {
    await AsyncStorage.setItem('selectedProjectId', projectId);
    setSelectedProjectId(projectId);
    fetchTasksByProject(projectId);
  };

  const handleLongPressProject = (projectId, title, description) => {
    console.log('projectid', projectId);
    
    Alert.alert(
      'Lựa chọn hành động',
      'Bạn muốn làm gì với project này?',
      [
        {text: 'Sửa', onPress: () => navigation.navigate('EditProject',{projectId, title, description})},
        {text: 'Xóa', onPress: () => handleDeleteProject(projectId)},
      ],
      {cancelable: true},
    );
  };


  const loadEmail = async () => {
    const storedEmail = await AsyncStorage.getItem('email');
    const token = await AsyncStorage.getItem('token');
    if (storedEmail && token) {
      try {
        const response = await fetch(
          `http://172.20.10.2:3001/api/users?email=${storedEmail}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        if (!response.ok) {
          throw new Error('Lỗi khi truy xuất dữ liệu người dùng');
        }
        const data = await response.json();
        setUserName(data[0].name);
        setEmail(data[0].email);
        const imageAvatar = data[0].avatar;
        console.log('avatar', imageAvatar);

        const avatarUri =
          typeof imageAvatar === 'string'
            ? imageAvatar.startsWith('uploads')
              ? `http://172.20.10.2:3001/${imageAvatar.replace(/\\/g, '/')}`
              : imageAvatar
            : '';
            console.log(avatarUri);
            
        setAvatar(avatarUri);
      } catch (error) {
        console.error('Lỗi:', error);
      }
    } else {
      console.log('Không tìm thấy email trong AsyncStorage');
    }
  };

  useEffect(() => {
    loadEmail();
    fetchProjects();
    const unsubscribe = navigation.addListener('focus', fetchProjects);
    return unsubscribe;
  }, [page, avatar]);

  const handleItemPress = async item => {
    try {
      await AsyncStorage.setItem('taskId', item._id);
      await AsyncStorage.setItem('selectedTask', JSON.stringify(item));
      navigation.navigate('Detail', {item});
    } catch (error) {
      console.error('Error saving task ID:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('email');
    navigation.navigate('Login');
  };

  const formatDate = isoString => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const weekdays = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ];
    const dayOfWeek = weekdays[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `Tạo lúc ${hours}:${minutes}, ${dayOfWeek}, ${day}/${month}/${year}`;
  };

  const pieData = [
    {
      name: 'Việc mới',
      population: tasks.filter(task => task.status === 'pending').length,
      color: '#42A5F5',
      legendFontColor: 'black',
      legendFontSize: 15,
    },
    {
      name: 'Đang thực hiện',
      population: tasks.filter(task => task.status === 'in-progress').length,
      color: '#66BB6A',
      legendFontColor: 'black',
      legendFontSize: 15,
    },
    {
      name: 'Hoàn thành',
      population: tasks.filter(task => task.status === 'completed').length,
      color: '#EF5350',
      legendFontColor: 'black',
      legendFontSize: 15,
    },
    {
      name: 'Chờ duyệt',
      population: tasks.filter(task => task.status === 'waiting_approval')
        .length,
      color: '#FFEE58',
      legendFontColor: 'black',
      legendFontSize: 15,
    },
    {
      name: 'Tạm dừng',
      population: tasks.filter(task => task.status === 'paused').length,
      color: '#7E57C2',
      legendFontColor: 'black',
      legendFontSize: 15,
    },
  ];

  const calculateProgress = tasks => {
    const completedTasks = tasks.filter(
      task => task.status === 'completed',
    ).length;
    const totalTasks = tasks.length;
    const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    return {
      completedTasks,
      totalTasks,
      percentage: Math.round(percentage),
    };
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View>
      <StatusBar barStyle="light-content" />
      <View style={styles.container1}>
        <TouchableOpacity style={styles.homeTouchable}>
          <Image
            source={require('../image/logo.webp')}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.touchable}
          onPress={() => navigation.navigate('Schedule')}>
          <Icon name="calendar" size={30} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.container2}>
        <TouchableOpacity style={styles.imageTouch}>
          <Image
            source={{uri: avatar}}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.textTouch}>
          <Text>{userName}</Text>
          <Text>{email}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container3}>
        <PieChart
          data={pieData}
          width={Dimensions.get('window').width}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {borderRadius: 16},
            propsForDots: {r: '6', strokeWidth: '2', stroke: '#000'},
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
      <View style={{height: 100, flexDirection: 'row'}}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {projects.map((project, index) => {
            const projectTasks = tasks.filter(
              task => task.project._id === project._id,
            );
            const {completedTasks, totalTasks, percentage} =
              calculateProgress(projectTasks);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  selectedProjectId === project._id && styles.selectedButton,
                ]}
                onPress={() => handleProjectClick(project._id)}
                onLongPress={() => handleLongPressProject(project._id, project.title, project.description)}>
                <Text style={styles.buttonText}>{project.title}</Text>
                <Text style={styles.buttonText}>
                  {totalTasks > 0 ? `${percentage}%` : '0%'}
                </Text>
                <Text style={styles.buttonText}>
                  Hoàn thành {completedTasks}/{totalTasks} việc
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddProject')}
          >
            <Icon name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </View>
      <View>
        <View>
          <View style={{height: 50, flexDirection: 'row'}}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => setPage(MOI_CAP_NHAT)}>
              <Text>MỚI CẬP NHẬT</Text>
              {page === MOI_CAP_NHAT ? <View style={styles.activeTab} /> : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => setPage(QUAN_TRONG)}>
              <Text>QUAN TRỌNG</Text>
              {page === QUAN_TRONG ? <View style={styles.activeTab} /> : null}
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.tabButton}
              onPress={() => setPage(TAI_LIEU)}>
              <Text>TÀI LIỆU</Text>
              {page === TAI_LIEU ? <View style={styles.activeTab} /> : null}
            </TouchableOpacity> */}
          </View>
          <ScrollView style={{height: 250}}>
            {page === MOI_CAP_NHAT && (
              <View>
                {tasks.length > 0 &&
                tasks.filter(task => task.isImportant === false).length > 0 ? (
                  tasks.map((task, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.taskItem}
                      onPress={() => handleItemPress(task)}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={styles.taskDescription}>
                        {formatDate(task.createdAt)}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text>Không có nhiệm vụ nào.</Text>
                )}
              </View>
            )}
            {page === QUAN_TRONG && (
              <View>
                {tasks.length > 0 &&
                tasks.filter(task => task.isImportant === true).length > 0 ? (
                  tasks
                    .filter(task => task.isImportant === true)
                    .map((task, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.taskItem}
                        onPress={() => handleItemPress(task)}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <Text style={styles.taskDescription}>
                          {formatDate(task.createdAt)}
                        </Text>
                      </TouchableOpacity>
                    ))
                ) : (
                  <Text>Không có nhiệm vụ quan trọng nào.</Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="home" size={25} color="#000" />
          <Text>Trang Chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('ProjectList')}>
          <Icon name="tasks" size={25} color="#000" />
          <Text>Công Việc</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => {
            if (selectedProjectId) {
              AsyncStorage.setItem('projectId', selectedProjectId)
                .then(() => {
                  navigation.navigate('AddSchedule');
                })
                .catch(error => {
                  console.error('Error saving project ID:', error);
                });
            } else {
              Alert.alert(
                'Chưa chọn dự án',
                'Vui lòng chọn một dự án trước khi thêm lịch.',
              );
            }
          }}>
          <FontistoIcon name="plus-a" size={25} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Users')}>
          <Icon name="users" size={25} color="#000" />
          <Text>Nhân Sự</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Setting')}>
          <Icon name="cog" size={25} color="#000" />
          <Text>Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container1: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    marginTop: 10,
  },
  image: {
    marginTop: 10,
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  homeTouchable: {
    flex: 7,
    justifyContent: 'center',
    marginLeft: 10,
  },
  touchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container2: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },
  imageTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  textTouch: {
    flex: 9,
    marginLeft: 20,
  },
  container3: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    borderWidth: 1,
    borderRadius: 30,
    marginLeft: 5,
    marginRight: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: 'blue',
    height: 3,
    width: '100%',
  },
  navButton: {
    height: 'auto',
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    marginBottom: 10,
    height: '120%',
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
    backgroundColor: '#42A5F5',
  },
  button: {
    backgroundColor: '#42A5F5',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 10,
  },
  buttonText: {
    justifyContent: 'center',
    alignItems: 'center',
    color: '#FFFFFF',
    fontSize: 14,
  },
  taskItem: {
    marginVertical: 5,
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  taskTitle: {
    fontWeight: 'bold',
  },
  taskDescription: {
    color: '#555',
  },
  selectedButton: {
    backgroundColor: '#1E88E5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#42A5F5',
    width: 100,
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginRight: 10,
  },
});

export default MainScreen;
