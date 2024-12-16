import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddUsers = () => {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState('');
  const [message, setMessage] = useState(
    'Lựa chọn nhân sự trong các phòng ban/bộ phận sẽ thực hiện phối hợp công việc',
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedProjectId = await AsyncStorage.getItem('selectedProjectId');
        const taskId = await AsyncStorage.getItem('taskId');
        const response = await fetch(
          `http://172.20.10.2:3001/api/projects/${storedProjectId}`,
          {
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        const data = await response.json();
        const acceptedEmployees = data.members
          .filter(user => user.status === 'accepted')
          .map(member => member.user);
        const acceptedIds = acceptedEmployees.map(employee => employee._id);
        console.log(acceptedIds);
        setEmployees(acceptedEmployees);
        const taskResponse = await fetch(
          `http://172.20.10.2:3001/api/tasks/${taskId}`,
          {
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        const taskData = await taskResponse.json();
        const assignees = taskData.assigness.map(assignee => assignee.user._id);
        console.log(assignees);
        const unassignedEmployees = acceptedEmployees.filter(
          employee => !assignees.includes(employee._id),
        );

        setEmployees(unassignedEmployees);
      } catch (error) {
        console.error('Lỗi khi tải danh sách nhân viên:', error);
      }
    };

    fetchEmployees();
  }, []);

  const toggleSelectEmployee = employeeId => {
    setSelectedEmployees(prevSelected =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter(id => id !== employeeId)
        : [...prevSelected, employeeId],
    );
  };
  const addAssigneesToTask = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const taskId = await AsyncStorage.getItem('taskId');
      selectedEmployees.forEach(async employeeId => {
        const response = await fetch(
          `http://172.20.10.2:3001/api/tasks/${taskId}/assignees`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({userId: employeeId}),
          },
        );

        if (response.ok) {
          setMessage('Thêm nhân sự vào task thành công!');
          navigation.goBack();
        } else {
          setMessage('Không thể thêm nhân sự vào task.');
          console.error('Lỗi khi thêm nhân sự:', await response.text());
        }
      });
    } catch (error) {
      console.error('Lỗi khi thêm nhân sự vào task:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>Chọn Nhân Sự</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="search" size={30} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="home" size={30} />
        </TouchableOpacity>
      </View>
      <Text style={styles.message}>{message}</Text>
      <FlatList
        data={employees}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userButton}
            onPress={() => {
              console.log(item._id);
              toggleSelectEmployee(item._id);
            }}>
            <Image
              source={{
                uri:
                  item.avatar && item.avatar.startsWith('upload')
                    ? `http://172.20.10.2:3001/${item.avatar.replace(
                        /\\/g,
                        '/',
                      )}`
                    : item.avatar ||
                      'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
              }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            {selectedEmployees.includes(item._id) && (
              <Icon
                name="check"
                size={20}
                style={styles.checkIcon}
                color="green"
              />
            )}
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.continueButton}
        onPress={addAssigneesToTask}>
        <Text style={styles.continueText}>TIẾP TỤC</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    flex: 7,
    fontSize: 20,
    textAlign: 'center',
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 16,
    paddingLeft: 10,
    marginVertical: 10,
  },
  userButton: {
    marginLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  checkIcon: {
    paddingLeft: 10,
  },
  continueButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    backgroundColor: '#42A5F5',
  },
  continueText: {
    color: 'white',
    fontSize: 18,
  },
});

export default AddUsers;
