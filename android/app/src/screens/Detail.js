import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import ArtIcon from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import * as Progress from 'react-native-progress';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Detail = ({navigation}) => {
  const [avatar, setAvatar] = useState('');
  const [task, setTask] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImportant, setIsImportant] = useState(false);
  const [comments, setcomments] = useState([]);
  const [messages, setMessages] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [file, setFile] = useState(null);
  const [downloadedFilePath, setDownloadedFilePath] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [timestamps, setTimestamps] = useState([]);
  const [role, setRole] = useState('');
  const formatDate = dateString => {
    const date = new Date(dateString);
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    };
    return date.toLocaleString('vi-VN', options).replace(/,/, ' ');
  };

  const statusMapping = {
    pending: 'Chờ xử lý',
    'in-progress': 'Đang thực hiện',
    completed: 'Hoàn thành',
    paused: 'Tạm dừng',
    'waiting-for-approval': 'Chờ phê duyệt',
  };

  const handleOptionSelect = async option => {
    try {
      console.log(option);

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://172.20.10.2:3001/api/tasks/${task._id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({status: option}),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedTask = await response.json();
      setTask(updatedTask.task);
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const translateStatus = status => statusMapping[status] || status;

  const fetchTask = async () => {
    const taskId = await AsyncStorage.getItem('taskId');
    const token = await AsyncStorage.getItem('token');
    if (taskId) {
      try {
        setLoading(true);
        const response = await fetch(
          `http://172.20.10.2:3001/api/tasks/${taskId}`,
          {
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`},
          },
        );

        if (response.ok) {
          const taskData = await response.json();
          setTask(taskData);
          setAvatar(taskData.user.avatar);
          setIsImportant(taskData.isImportant);
          setAssignedUsers(
            taskData.assigness.map(assign => ({
              user: assign.user,
              subTasks: assign.subTasks,
            })),
          );
          setTimestamps(taskData.log);

          const member = taskData.project.members.find(member => {
            return member.user._id === currentUserId;
          });
          if (member) {
            setRole(member.role);
          }

          if (taskData.comments) {
            setcomments(taskData.comments);
          }
          if (taskData.files) {
            setFile(taskData.files);
          }
        } else {
          const error = await response.json();
          alert(`Lỗi khi lấy thông tin công việc: ${error.message}`);
        }
      } catch (error) {
        alert('Có lỗi xảy ra khi lấy thông tin công việc');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };
  const toggleSubTaskCompletion = async (assigneeId, subTaskId) => {
    try {
      const taskId = await AsyncStorage.getItem('taskId');
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://172.20.10.2:3001/api/tasks/${taskId}/assignees/${assigneeId}/subtasks/${subTaskId}/toggle`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) {
        throw new Error('Failed to toggle sub-task completion');
      }
    } catch (error) {
      console.error('Error toggling sub-task completion:', error);
    }
  };

  const markTaskAsImportant = async () => {
    try {
      const taskId = await AsyncStorage.getItem('taskId');
      const token = await AsyncStorage.getItem('token');
      if (!taskId) {
        alert('Không tìm thấy ID công việc để cập nhật!');
        return;
      }

      const response = await fetch(
        `http://172.20.10.2:3001/api/tasks/${taskId}/important`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({isImportant: !isImportant}),
        },
      );

      if (response.ok) {
        setIsImportant(!isImportant);
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.message}`);
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
      console.error(error);
    }
  };

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Yêu cầu quyền truy cập tệp',
          message: 'Ứng dụng cần quyền để truy cập các tệp của bạn.',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Đồng ý',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleAddFile = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Thông báo', 'Không có quyền truy cập tệp');
      return;
    }

    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      console.log('Hello', res);

      const token = await AsyncStorage.getItem('token');
      const taskId = await AsyncStorage.getItem('taskId');

      const formData = new FormData();
      res.forEach(file => {
        formData.append('files', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      });

      const response = await fetch(
        `http://172.20.10.2:3001/api/tasks/${taskId}/files`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        Alert.alert('Thông báo', 'Thêm file thành công!');
      } else {
        Alert.alert('Thông báo', 'Đã có lỗi khi thêm file');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Người dùng đã hủy chọn file');
      } else {
        console.error('Lỗi khi chọn file:', err);
      }
    }
  };

  const handleDownloadFile = async file => {
    console.log(file);

    try {
      const fileUri =
        'http://172.20.10.2:3001/' + file.url.replace(/\\/g, '/');
      const fileName = file.name;
      downloadUri = RNFS.ExternalDirectoryPath + fileName;

      console.log('Tải file từ:', fileUri);
      console.log('Lưu file tại:', downloadUri);

      const downloadResult = await RNFS.downloadFile({
        fromUrl: fileUri,
        toFile: downloadUri,
      }).promise;

      setDownloadedFilePath(
        downloadResult.statusCode === 200 ? downloadUri : null,
      );

      if (downloadResult.statusCode === 200) {
        Alert.alert('Thông báo', 'Tải file thành công!');
      } else {
        Alert.alert('Thông báo', 'Đã có lỗi khi tải file');
      }
    } catch (error) {
      console.error('Lỗi khi tải file:', error);
      Alert.alert('Thông báo', 'Đã có lỗi khi tải file');
    }
  };

  const handleDeleteFile = async file => {
    const fileId = file._id;
    Alert.alert(
      'Xác nhận xóa tài liệu',
      `Bạn có chắc chắn muốn xóa tài liệu này?`,
      [
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              const taskId = await AsyncStorage.getItem('taskId');
              const token = await AsyncStorage.getItem('token');

              const response = await fetch(
                `http://172.20.10.2:3001/api/tasks/${taskId}/files/${fileId}`,
                {
                  method: 'DELETE',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (response.ok) {
                setFile(prevFiles =>
                  prevFiles.filter(file => file._id !== fileId),
                );
                Alert.alert('Thông báo!', 'Đã xóa tài liệu thành công');
              } else {
                Alert('Thông báo!', 'Xóa tài thất bại');
              }
            } catch (error) {
              console.error('Lỗi khi xóa tài liệu:', error);
            }
          },
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const removeAssignee = async assign => {
    Alert.alert(
      'Xác nhận xóa nhân sự',
      `Bạn có chắc chắn muốn xóa ${assign.user.name} khỏi công việc này?`,
      [
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              const taskId = await AsyncStorage.getItem('taskId');
              const assigneeId = assign.user._id;
              const token = await AsyncStorage.getItem('token');

              const response = await fetch(
                `http://172.20.10.2:3001/api/tasks/${taskId}/assignees/${assigneeId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (response.ok) {
                setAssignedUsers(prevUsers =>
                  prevUsers.filter(user => user.user._id !== assigneeId),
                );
                console.log('Đã xóa nhân sự thành công');
              } else {
                console.log('Xóa nhân sự thất bại');
              }
            } catch (error) {
              console.error('Lỗi khi xóa nhân sự:', error);
            }
          },
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const handleLongPress = (assigneeId, subTaskId) => {
    const assignee = assignedUsers.find(
      assign => assign.user._id === assigneeId,
    );
    if (assignee) {
      const subTask = assignee.subTasks.find(task => task._id === subTaskId);

      if (subTask) {
        Alert.alert(
          'Tùy chọn',
          'Bạn muốn làm gì với subtasks này?',
          [
            {
              text: 'Sửa',
              onPress: () => {
                navigation.navigate('EditSubtask', {
                  subTaskId: subTask._id,
                  title: subTask.title,
                  subTask: subTask,
                  onSubmit: updatedSubTask => {
                    const updatedAssignedUsers = assignedUsers.map(assign => ({
                      ...assign,
                      subTasks: assign.subTasks.map(task =>
                        task._id === updatedSubTask._id ? updatedSubTask : task,
                      ),
                    }));
                    setAssignedUsers(updatedAssignedUsers);
                  },
                });
              },
            },
            {
              text: 'Xóa',
              onPress: () => {
                deleteSubTask(assigneeId, subTaskId);
              },
            },
          ],
          {cancelable: true},
        );
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy subtask.');
      }
    } else {
      Alert.alert('Lỗi', 'Không tìm thấy assignee.');
    }
  };

  const handleLongPresscmt = commentId => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn muốn xóa phản hồi này?',
      [
        {
          text: 'Xóa',
          onPress: () => {
            deleteComment(commentId);
          },
        },
      ],
      {cancelable: true},
    );
  };

  const deleteComment = async commentId => {
    try {
      const taskId = await AsyncStorage.getItem('taskId');
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://172.20.10.2:3001/api/tasks/${taskId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const newcomments = comments.filter(
          comment => comment._id !== commentId,
        );
        setcomments(newcomments);
        Alert.alert('Thành Công', 'Xóa comment thành công');
      } else {
        console.error('Xóa thất bại:', response.statusText);
        Alert.alert('Lỗi', 'Không thể xóa comment');
      }
    } catch (error) {
      console.error('Lỗi khi xóa comment:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xóa comment');
    }
  };

  const deleteSubTask = async (assigneeId, subTaskId) => {
    try {
      const taskId = await AsyncStorage.getItem('taskId');
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://172.20.10.2:3001/api/tasks/${taskId}/assignees/${assigneeId}/subtasks/${subTaskId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const newAssignedUsers = assignedUsers.map(assign => ({
          ...assign,
          subTasks: assign.subTasks.filter(
            subTask => subTask._id !== subTaskId,
          ),
        }));

        setAssignedUsers(newAssignedUsers);
        Alert.alert('Thành Công', 'Xóa Subtask thành công');
      } else {
        console.error('Thêm thất bại:', response.statusText);
        Alert.alert('Lỗi', 'Xóa Subtask thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi xóa task', error);
    }
  };

  const addComment = async (messages, setMessages) => {
    try {
      const taskId = await AsyncStorage.getItem('taskId');
      const token = await AsyncStorage.getItem('token');

      if (!taskId || !token) {
        Alert.alert('Lỗi', 'Không thể tìm thấy thông tin cần thiết.');
        return;
      }

      const response = await fetch(
        `http://172.20.10.2:3001/api/tasks/${taskId}/comments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({comment: messages}),
        },
      );

      if (response.ok) {
        setMessages('');
        const result = await response.json();
        setcomments(result.task.comments);
        console.log(result.task.comments);
      } else {
        const error = await response.json();
        Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      Alert.alert('Có lỗi xảy ra', error.message);
      console.error(error);
    }
  };

  const calculateProgress = assigness => {
    const totalSubTasks = assigness.reduce(
      (lastTotal, assigne) => lastTotal + assigne.subTasks.length,
      0,
    );

    const totalCompletedSubTasks = assigness.reduce((lastTotal, assigne) => {
      return (
        lastTotal +
        assigne.subTasks.reduce((subTasksCompletedTotal, subTask) => {
          return subTask.completed
            ? subTasksCompletedTotal + 1
            : subTasksCompletedTotal;
        }, 0)
      );
    }, 0);

    return totalSubTasks > 0 ? totalCompletedSubTasks / totalSubTasks : 0;
  };
  useEffect(() => {
    fetchTask();
    const fetchCurrentUserId = async () => {
      const userId = await getCurrentUserId();
      console.log(userId);
      setCurrentUserId(userId);
    };

    fetchCurrentUserId();
  }, []);
  const getCurrentUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://172.20.10.2:3001/api/users/information',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data._id) {
          return data._id;
        } else {
          console.error('Invalid response structure:', data);
          return null;
        }
      }
    } catch (error) {
      console.error('Error retrieving currentUserId:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  function timeAgo(date) {
    const now = new Date();
    const pastDate = new Date(date);
    const seconds = Math.floor((now - pastDate) / 1000 + 86);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 năm trước' : `${interval} năm trước`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 tháng trước' : `${interval} tháng trước`;
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 ngày trước' : `${interval} ngày trước`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 giờ trước' : `${interval} giờ trước`;
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 phút trước' : `${interval} phút trước`;
    }

    return seconds === 1 ? '1 giây trước' : `${seconds} giây trước`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Công Việc</Text>
        <TouchableOpacity
          style={styles.ellipsisButton}
          onPress={() => setModalVisible(true)}>
          <Icon name="ellipsis-v" size={30} />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption}>
              {task.status === 'pending' && (
                <TouchableOpacity
                  onPress={() => handleOptionSelect('in-progress')}>
                  <Text style={styles.modalOptionText}>
                    Thực Hiện Công Việc
                  </Text>
                </TouchableOpacity>
              )}
              {task.status === 'in-progress' && role === 'employee' && (
                <TouchableOpacity
                  onPress={() => handleOptionSelect('waiting-for-approval')}>
                  <Text style={styles.modalOptionText}>
                    Xác nhận hoàn thành
                  </Text>
                </TouchableOpacity>
              )}
              {task.status === 'in-progress' && role !== 'employee' && (
                <TouchableOpacity
                  onPress={() => handleOptionSelect('completed')}>
                  <Text style={styles.modalOptionText}>
                    Xác nhận hoàn thành
                  </Text>
                </TouchableOpacity>
              )}
              {task.status === 'waiting-for-approval' &&
                role !== 'employee' && (
                  <TouchableOpacity
                    onPress={() => handleOptionSelect('completed')}>
                    <Text style={styles.modalOptionText}>Duyệt công việc</Text>
                  </TouchableOpacity>
                )}
              {task.status === 'completed' && role !== 'employee' && (
                <TouchableOpacity
                  onPress={() => handleOptionSelect('in-progress')}>
                  <Text style={styles.modalOptionText}>Làm lại</Text>
                </TouchableOpacity>
              )}
              {task.status === 'paused' && role !== 'employee' && (
                <TouchableOpacity
                  onPress={() => handleOptionSelect('in-progress')}>
                  <Text style={styles.modalOptionText}>Tiếp tục công việc</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {task.status === 'pending' && role !== 'employee' && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleOptionSelect('completed')}>
                <Text style={styles.modalOptionText}>Xác Nhận Hoàn Thành</Text>
              </TouchableOpacity>
            )}
            {task.status === 'waiting-for-approval' && role !== 'employee' && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleOptionSelect('in-progress')}>
                <Text style={styles.modalOptionText}>Yêu cầu làm lại</Text>
              </TouchableOpacity>
            )}
            {task.status !== 'completed' &&
              task.status !== 'paused' &&
              role !== 'employee' && (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleOptionSelect('paused')}>
                  <Text style={styles.modalOptionText}>Tạm dừng</Text>
                </TouchableOpacity>
              )}
            <View style={styles.editTask}>
              {role !== 'employee' && (
                <TouchableOpacity
                  style={styles.editDetail}
                  onPress={() => handleOptionSelect('Xóa')}>
                  <Text style={styles.modalOptionText}>Xóa</Text>
                </TouchableOpacity>
              )}
              {role !== 'employee' && (
                <TouchableOpacity
                  style={styles.editDetail}
                  onPress={() => handleOptionSelect('Sửa')}>
                  <Text style={styles.modalOptionText}>Sửa</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.editDetail}
                onPress={() => navigation.navigate('History', {timestamps})}>
                <Text style={styles.modalOptionText}>Lịch Sử</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.detailContainer}>
        {task ? (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
              <Text style={{color: '#42A5F5'}}>
                {translateStatus(task.status)}
              </Text>
              <Text style={{color: 'red'}}>
                Thời hạn:{' '}
                {task.endDate ? formatDate(task.endDate) : 'Chưa xác định'}
              </Text>
            </View>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
              <Image
                source={{
                  uri:
                    avatar && avatar.startsWith('upload')
                      ? `http://172.20.10.2:3001/${avatar.replace(/\\/g, '/')}`
                      : avatar ||
                        'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
                }}
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={{flex: 5}}>
                <Text
                  style={{paddingLeft: 5, fontSize: 20, fontWeight: 'bold'}}>
                  {task.user.name}
                </Text>
                <Text style={{paddingLeft: 5}}>{task.user.email}</Text>
              </View>
              <View
                style={{
                  flex: 5,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <TouchableOpacity
                  style={[
                    styles.importantButton,
                    isImportant ? styles.important : styles.notImportant,
                  ]}
                  onPress={markTaskAsImportant}>
                  <Text style={styles.buttonText}>Quan Trọng</Text>
                </TouchableOpacity>
                <Text style={{fontSize: 10}}>
                  Tạo lúc:{' '}
                  {task.createdAt
                    ? formatDate(task.createdAt)
                    : 'Chưa xác định'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text>Không tìm thấy thông tin công việc.</Text>
        )}

        <View style={styles.subtaskContainer}>
          <Progress.Bar
            progress={calculateProgress(task.assigness)}
            width={null}
            color="#42A5F5"
            height={10}
            borderRadius={5}
            borderColor="#ccc"
          />
        </View>
      </View>
      <View style={styles.attachmentContainer}>
        <View style={styles.attachmentInfo}>
          <Text style={styles.sectionTitle}>File đính kèm</Text>
          <FeatherIcon
            name="file-plus"
            size={20}
            color={'#42A5F5'}
            onPress={handleAddFile}
          />
        </View>
        <ScrollView style={{maxHeight: 50}}>
          {file.map(file => (
            <View key={file._id} style={styles.fileItem}>
              <View>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileDate}>
                  {`Thêm lúc: ${formatDate(file.createdAt)}`}
                </Text>
              </View>
              <View style={styles.fileActions}>
                <FeatherIcon
                  name="download"
                  size={20}
                  color={'#42A5F5'}
                  onPress={() => handleDownloadFile(file)}
                />
                <ArtIcon
                  name="delete"
                  size={20}
                  color={'#42A5F5'}
                  onPress={() => handleDeleteFile(file)}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 10,
        }}>
        <Text style={styles.sectionTitle}>Người Thực Hiện</Text>
        <Icon
          name="user-plus"
          size={20}
          color="#007BFF"
          onPress={() => navigation.navigate('AddUsers')}
        />
      </View>
      <ScrollView style={styles.assigneesContainer}>
        {assignedUsers.map(assign => (
          <View key={assign.user._id} style={styles.assigneeItem}>
            <View style={styles.assigneeInformation}>
              {assign.user.avatar && (
                <Image
                  source={{
                    uri:
                      assign.user.avatar &&
                      assign.user.avatar.startsWith('upload')
                        ? `http://172.20.10.2:3001/${assign.user.avatar.replace(
                            /\\/g,
                            '/',
                          )}`
                        : assign.user.avatar ||
                          'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
                  }}
                  style={styles.avatar}
                />
              )}
              <TouchableOpacity
                style={styles.assigneeInfoContainer}
                onPress={() => removeAssignee(assign)}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{assign.user.name}</Text>
                  <Text style={styles.userEmail}>{assign.user.email}</Text>
                </View>
                <FeatherIcon
                  name="check-square"
                  size={20}
                  color={'#007BFF'}
                  onPress={async () => {
                    await AsyncStorage.setItem('assigneeId', assign.user._id);
                    navigation.navigate('AddSubtask', {
                      onSubmit: taskNew => {
                        setAssignedUsers(
                          taskNew.assigness
                            .filter(
                              assign =>
                                assign.subTasks && assign.subTasks.length > 0,
                            )
                            .map(assign => ({
                              user: assign.user,
                              subTasks: assign.subTasks,
                            })),
                        );
                      },
                    });
                  }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.subTasksContainer}>
              {assign.subTasks.map(subTask => (
                <TouchableOpacity
                  key={subTask._id}
                  style={styles.subTaskItem}
                  onLongPress={() =>
                    handleLongPress(assign.user._id, subTask._id)
                  }>
                  <View style={styles.subTaskInfo}>
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          await AsyncStorage.setItem(
                            'assigneeId',
                            assign.user._id,
                          );
                          await toggleSubTaskCompletion(
                            assign.user._id,
                            subTask._id,
                          );

                          const assignedIndex = assignedUsers.findIndex(
                            assignee => assignee.user._id === assign.user._id,
                          );

                          if (assignedIndex === -1) {
                            console.error('Assigned user not found');
                            return;
                          }

                          const subTaskIndex = assignedUsers[
                            assignedIndex
                          ].subTasks.findIndex(
                            subTaskLoop => subTaskLoop._id === subTask._id,
                          );

                          if (subTaskIndex === -1) {
                            console.error('Subtask not found');
                            return;
                          }
                          const newAssignedUsers = [...assignedUsers];
                          newAssignedUsers[assignedIndex].subTasks[
                            subTaskIndex
                          ].completed =
                            !newAssignedUsers[assignedIndex].subTasks[
                              subTaskIndex
                            ].completed;
                          setAssignedUsers([...newAssignedUsers]);
                        } catch (error) {
                          console.error(
                            'Error toggling subtask completion:',
                            error,
                          );
                        }
                      }}>
                      {subTask.completed ? (
                        <Ionicons
                          name="checkbox-outline"
                          size={30}
                          color={'#007BFF'}
                          style={{marginRight: 4}}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="checkbox-blank-outline"
                          size={30}
                          color={'#007BFF'}
                          style={{marginRight: 4}}
                        />
                      )}
                    </TouchableOpacity>
                    <View>
                      <Text style={styles.subTaskTitle}>{subTask.title}</Text>
                      <Text style={styles.subTaskToggleBy}>
                        {subTask.toggleBy.name}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.subTaskToggleBy}>
                    {timeAgo(subTask.toggleAt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <KeyboardAvoidingView
        style={styles.commentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={styles.sectionTitle}>Thảo luận</Text>
        <ScrollView style={styles.scrollView}>
          {comments.length > 0 &&
            comments.map(comment => (
              <TouchableOpacity
                key={comment._id}
                style={[
                  comment.user._id === currentUserId ? styles.commentItem : styles.commentItemReverse,
                  comment.user._id === currentUserId
                    ? styles.myMessage
                    : styles.otherMessage,
                ]}
                onLongPress={() => handleLongPresscmt(comment._id)}>
                <View style={styles.comment}>
                  <Text style={styles.commentTimestamp}>
                    {timeAgo(comment.timestamps)}
                  </Text>
                  <Text style={{color: '#FFFFFF'}}>{comment.comment}</Text>
                </View>
                <Image
                  source={{
                    uri:
                      comment.user.avatar &&
                      comment.user.avatar.startsWith('upload')
                        ? `http://172.20.10.2:3001/${comment.user.avatar.replace(
                            /\\/g,
                            '/',
                          )}`
                        : comment.user.avatar ||
                          'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
                  }}
                  style={styles.avatarComment}
                />
              </TouchableOpacity>
            ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={messages}
            onChangeText={setMessages}
            autoCapitalize="sentences"
          />
          <Button
            title="Gửi"
            onPress={() => {
              addComment(messages, setMessages);
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 8,
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 20,
  },
  ellipsisButton: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  detailContainer: {
    marginBottom: 5,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    borderColor: '#D3D3D3',
  },
  sectionTitle: {
    color: '#42A5F5',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textDecorationLine: 'underline',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  importantButton: {
    padding: 1,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  notImportant: {
    backgroundColor: 'grey',
  },
  important: {
    backgroundColor: '#FFA500',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subtaskContainer: {
    marginTop: 10,
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
  },
  assigneesContainer: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    borderColor: '#D3D3D3',
    flex: 1,
  },
  assigneeItem: {
    flexDirection: 'column',
    alignItems: 'start',
    marginBottom: 10,
  },
  assigneeInformation: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subTasksContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'start',
    width: '100%',
  },
  subTaskItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 8,
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 1,
  },
  subTaskInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subTaskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  commentContainer: {
    flex: 1,
    marginTop: 5,
  },
  commentItem: {
    width: '60%',
    flexDirection: 'row',
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  commentItemReverse: {
    width: '60%',
    flexDirection: 'row-reverse',
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 8
  },
  comment: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    padding: 8,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: '#29B6F6',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  attachmentContainer: {
    flexDirection: 'column',
    marginTop: 5,
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    borderColor: '#D3D3D3',
  },
  attachmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  attachmentText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007BFF',
  },
  assigneeInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#D3D3D3',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#555',
  },
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatarComment: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  commentTimestamp: {
    color: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: 10,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 5,
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
  },
  modalOption: {
    alignItems: 'center',
    backgroundColor:'#42A5F5',
    width: '100%',
    borderWidth: 1,
    borderRadius:5,
    margin: 4,
    padding: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  editTask: {
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  editDetail: {
    borderRadius:5,
    backgroundColor:'#42A5F5',
    borderWidth: 1,
    padding: 5,
    flexGrow: 1,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Detail;
