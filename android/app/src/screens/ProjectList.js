import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIEC_MOI = 'VIEC_MOI';
const DANG_THUC_HIEN = 'DANG_THUC_HIEN';
const HOAN_THANH = 'HOAN_THANH';
const CHO_DUYET = 'CHO_DUYET';
const TAM_DUNG = 'TAM_DUNG';

const ProjectList = () => {
  const navigation = useNavigation();
  const [page, setPage] = useState(VIEC_MOI);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedProjectId = await AsyncStorage.getItem('selectedProjectId');
        console.log(data);
        const response = await fetch(
          `http://172.20.10.2:3001/api/projects/${storedProjectId}/tasks`,
          {
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filterTasksByPage = () => {
    switch (page) {
      case VIEC_MOI:
        return tasks.filter(task => task.status === 'pending');
      case DANG_THUC_HIEN:
        return tasks.filter(task => task.status === 'in_progress');
      case HOAN_THANH:
        return tasks.filter(task => task.status === 'completed');
      case CHO_DUYET:
        return tasks.filter(task => task.status === 'waiting_approval');
      case TAM_DUNG:
        return tasks.filter(task => task.status === 'paused');
      default:
        return tasks;
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{height: 55, flexDirection: 'row'}}>
        <TouchableOpacity
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>Thông Tin Công Việc</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Schedule')}>
          <Icon name="calendar" size={30} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('MainScreen')}>
          <Icon name="home" size={30} />
        </TouchableOpacity>
      </View>
      <View style={{flexDirection: 'row'}}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setPage(VIEC_MOI)}>
            <Text style={styles.tabText}>VIỆC MỚI</Text>
            {page === VIEC_MOI ? <View style={styles.activeTab} /> : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setPage(DANG_THUC_HIEN)}>
            <Text style={styles.tabText}>ĐANG THỰC HIỆN</Text>
            {page === DANG_THUC_HIEN ? <View style={styles.activeTab} /> : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setPage(HOAN_THANH)}>
            <Text style={styles.tabText}>HOÀN THÀNH</Text>
            {page === HOAN_THANH ? <View style={styles.activeTab} /> : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setPage(CHO_DUYET)}>
            <Text style={styles.tabText}>ĐANG CHỜ DUYỆT</Text>
            {page === CHO_DUYET ? <View style={styles.activeTab} /> : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setPage(TAM_DUNG)}>
            <Text style={styles.tabText}>TẠM DỪNG</Text>
            {page === TAM_DUNG ? <View style={styles.activeTab} /> : null}
          </TouchableOpacity>
        </ScrollView>
      </View>
      <ScrollView>
        {filterTasksByPage().length > 0 ? (
          filterTasksByPage().map(task => (
            <TouchableOpacity onPress={() => navigation.navigate('Detail')}>
              <View key={task._id} style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>
                  Mô tả: {task.description}
                </Text>
                <Text
                  style={[
                    styles.taskStatus,
                    task.status === 'pending' && {color: '#42A5F5'},
                    task.status === 'completed' && {color: '#66BB6A'},
                    task.status === 'in_progress' && {color: '#66BB6A'},
                    task.status === 'paused' && {color: '#EF5350'},
                    task.status === 'pauwaiting_approval' && {color: '#EF5350'},
                  ]}>
                  Trạng thái:
                  {task.status === 'pending'
                    ? ' Việc mới'
                    : task.status === 'completed'
                    ? ' Đã hoàn thành'
                    : task.status === 'in_progress'
                    ? 'Đang thực hiện'
                    : task.status === 'paused'
                    ? 'Tạm dừng'
                    : ' Chờ duyệt'}
                </Text>
                <Text style={styles.taskDate}>
                  Ngày bắt đầu: {formatDate(task.startDate)}
                </Text>
                <Text style={styles.taskDate}>
                  Ngày kết thúc: {formatDate(task.endDate)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noTasksContainer}>
            <Text style={styles.noTasksText}>
              Không có công việc nào để hiển thị.
            </Text>
          </View>
        )}
      </ScrollView>

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
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    flex: 7,
    alignItems: 'center',
    fontSize: 20,
    textAlignVertical: 'center',
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 10,
    padding: 10,
  },
  tabText: {
    fontWeight: 'bold',
  },
  activeTab: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
    backgroundColor: '#42A5F5',
  },
  taskInfo: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    margin: 10,
    borderRadius: 10,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  taskStatus: {
    fontSize: 16,
    marginBottom: 10,
    color: 'green',
  },
  taskDate: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
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
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noTasksText: {
    fontSize: 18,
    color: '#555',
  },
});

export default ProjectList;
