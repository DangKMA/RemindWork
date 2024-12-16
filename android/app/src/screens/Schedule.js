import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Schedule = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState('2024-10-13');
  const [tasks, setTasks] = useState({});

  const statusMapping = {
    pending: 'Chờ xử lý',
    'in-progress': 'Đang thực hiện',
    completed: 'Hoàn thành',
    paused: 'Tạm dừng',
    'waiting-for-approval': 'Chờ phê duyệt',
  };
  const formatDate = dateString => {
    const date = new Date(dateString);
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleString('vi-VN', options).replace(/,/, ' ');
  };

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://172.20.10.2:3001/api/tasks', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (Array.isArray(result)) {
        const formattedTasks = {};
        result.forEach(task => {
          const date = task.startDate.split('T')[0];
          if (!formattedTasks[date]) {
            formattedTasks[date] = [];
          }
          formattedTasks[date].push({
            id: task._id,
            title: task.title,
            createdAt: task.createdAt,
            status: task.status,
            creator: task.user.name,
            avatar: task._id.avatar,
          });
        });
        setTasks(formattedTasks);
      } else {
        console.error('Expected an array:', result);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const markedDates = Object.keys(tasks).reduce((acc, date) => {
    acc[date] = {marked: true};
    return acc;
  }, {});

  const renderTaskItem = ({item}) => {
    console.log('item', item);

    return (
      <View style={styles.taskItem}>
        <Image
          source={{
            uri:
              item.avatar && item.avatar.startsWith('upload')
                ? `http://172.20.10.2:3001/${item.avatar.replace(/\\/g, '/')}`
                : item.avatar ||
                  'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
          }}
          style={styles.avatar}
        />
        <View style={styles.taskContent}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.taskInfo}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.taskStatus}>- {item.creator}</Text>
          </View>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.statusTitle}>{statusMapping[item.status]}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}>
          <Icon name="arrow-left" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch Công Việc</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="home" size={30} 
          onPress={()=>navigation.navigate('MainScreen')}/>
        </TouchableOpacity>
      </View>
      <Calendar
        style={styles.calendar}
        current={selectedDate}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            selected: true,
            marked: false,
            selectedColor: 'blue',
          },
        }}
      />
      <View style={styles.taskContainer}>
        {tasks[selectedDate] ? (
          <FlatList
            data={tasks[selectedDate]}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderTaskItem}
          />
        ) : (
          <Text>Không có công việc cho ngày này</Text>
        )}
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          paddingVertical: 10,
        }}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('MainScreen')}>
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
          onPress={() => navigation.navigate('AddSchedule')}>
          <FontistoIcon name="plus-a" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Users')}>
          <Icon name="users" size={25} color="#000" />
          <Text>Nhân Sự</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="cog" size={25} color="#000" />
          <Text>Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: 'gray',
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 8,
    fontSize: 20,
    textAlign: 'center',
  },
  calendar: {
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    height: 350,
  },
  taskContainer: {
    marginTop: 20,
    padding: 10,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    borderRadius: 8,

    borderColor: '#ddd',
  },
  avatar: {
    borderWidth: 1,
    borderColor: '#EF5350',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  taskContent: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    borderColor: '#BDBDBD',
  },
  taskInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusTitle: {
    color: '#42A5F5',
  },
  taskStatus: {
    fontSize: 14,
    color: '#42A5F5',
  },
  navButton: {
    height: 'auto',
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    marginBottom: 10,
    height: '130%',
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
    backgroundColor: '#42A5F5',
  },
});

export default Schedule;
