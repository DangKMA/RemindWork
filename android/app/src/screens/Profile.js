import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({route}) => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState({
    pending: 0,
    in_progress: 0,
    waiting: 0,
    completed: 0,
  });
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const {employee, isAdmin} = route.params;

  useEffect(() => {
    const fetchData = async () => {
      await fetchTasks();
      console.log(isAdmin);
      const unsubscribe = navigation.addListener('focus', fetchTasks);
      return unsubscribe;
    };

    fetchData();
  }, []);

  const fetchTasks = async () => {
    const projectId = await AsyncStorage.getItem('selectedProjectId');
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(
        `http://172.20.10.2:3001/api/projects/${projectId}/mytasks`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        const taskCounts = {
          pending: data.filter(task => task.status === 'pending').length,
          in_progress: data.filter(task => task.status === 'in_progress')
            .length,
          waiting: data.filter(task => task.status === 'waiting').length,
          completed: data.filter(task => task.status === 'completed').length,
        };

        setTasks(taskCounts);

        const totalTasks = data.length;
        const completedTasks = taskCounts.completed;
        const percentage =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        setCompletionPercentage(percentage.toFixed(2));
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch tasks:', errorData);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  const formatDate = dateString => {
    const date = new Date(dateString);
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    };
    return date.toLocaleString('vi-VN', options).replace(/,/, ' ');
  };

  const handleEdit = () => {
    setModalVisible(false);
    navigation.navigate('Profile', {employee});
  };

  const handleDelete = async () => {
    const projectId = await AsyncStorage.getItem('selectedProjectId');
    const token = await AsyncStorage.getItem('token');
    const userId = employee._id;
    try {
      const response = await fetch(
        `http://172.20.10.2:3001/api/projects/${projectId}/members/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        Alert.alert('Thành công', 'Xóa thành viên thành công!');
        setModalVisible(false);
        navigation.navigate('Users', {refresh: true});
      } else {
        const errorData = await response.json();
        console.error('Failed to delete member:', errorData);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{height: 50, flexDirection: 'row'}}>
        <TouchableOpacity
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20}></Icon>
        </TouchableOpacity>
        <Text
          style={{
            flex: 8,
            alignItems: 'center',
            fontSize: 20,
            textAlignVertical: 'center',
            fontWeight: 'bold',
          }}>
          Nhân Sự
        </Text>
        {isAdmin ? (
          <TouchableOpacity
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => {
              setModalVisible(true);
            }}>
            <Icon name="ellipsis-v" size={30} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={{height: '35%', alignItems: 'center'}}>
        <Image
          source={{
            uri:
              employee.avatar && employee.avatar.startsWith('upload')
                ? `http://172.20.10.2:3001/${employee.avatar.replace(
                    /\\/g,
                    '/',
                  )}`
                : employee.avatar ||
                  'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
          }}
          style={styles.profileImage}
        />
        <Text style={styles.email}>{employee.email.split('@')[0]}</Text>
        <Text style={styles.email}>
          Hoàn thành {completionPercentage}% công việc được giao
        </Text>
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Chọn Thao Tác</Text>
              {employee.role === 'admin' ? (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() =>
                    navigation.navigate('EditProfile', {employee})
                  }>
                  <Text style={styles.modalButtonText}>Sửa thông tin</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() =>
                      navigation.navigate('EditProfile', {employee})
                    }>
                    <Text style={styles.modalButtonText}>Sửa thông tin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleDelete}>
                    <Text style={styles.modalButtonText}>Xóa tài khoản</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: '#ccc'}]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FlatList
          data={[
            {key: 'pending', label: 'Việc mới', count: tasks.pending},
            {
              key: 'in_progress',
              label: 'Đang thực hiện',
              count: tasks.in_progress,
            },
            {key: 'waiting', label: 'Chờ duyệt', count: tasks.waiting},
            {key: 'completed', label: 'Hoàn thành', count: tasks.completed},
          ]}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>{item.count}</Text>
              <Text style={styles.buttonText}>{item.label}</Text>
            </TouchableOpacity>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 10}}
          ItemSeparatorComponent={() => <View style={{width: 10}} />}
        />
      </View>
      <View style={styles.inforContainer}>
        <Text style={styles.inforText}>Thông tin cá nhân</Text>
        <Text style={styles.text}>Gmail: {employee.email}</Text>
        <Text style={styles.text}>Vai trò: {employee.role}</Text>
        <Text style={styles.text}>
          Tham gia dự án: {formatDate(employee.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 2,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    lineHeight: 24,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007BFF',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 8,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#42A5F5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inforText: {
    fontWeight: '700',
    fontSize: 22,
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
    paddingBottom: 5,
  },
  inforContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 8,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;
