import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore/lite";
import { clarifyError, db } from "./fb.user";
import CryptoJS from "crypto-js";
import uniqid from 'uniqid';

const tables = {
    lists: "tasks-list", // "to-do-lists",
    tasks: "tasks-todo" // "to-do-tasks",
};

async function addNewList(user, label) {
    const created = (() => {
        const date = new Date();
        return date.setTime(date.getTime());
    })();
    try {
        const req = uniqid();
        const encrypt = CryptoJS.AES.encrypt(label, req).toString();
        const data = await setDoc(doc(db, tables.lists, req), {
            uid: user.uid,
            label: encrypt,
            deleted: false,
            created,
            updated: created,
        });
        return {
            type: "success",
            action: "add-list",
            data: data
        };
    } catch (err) {
        console.error(err);
        return clarifyError(err);
    }
}

async function updateList(list, field, value) {
    const timestamp = (() => {
        const date = new Date();
        return date.setTime(date.getTime());
    })();
    const getFieldValues = () => {
        const obj = {
            updated: timestamp,
        };
        obj[field] = (field === "label") ? CryptoJS.AES.encrypt(value, list).toString() : value;
        return obj;
    };
    try {
        await updateDoc(doc(db, tables.lists, list), getFieldValues());
        return {
            type: "success",
            action: "update-list",
            data: ""
        }
    } catch (err) {
        console.error(err);
        return clarifyError(err);
    }
}

async function addNewTask(user, list, task, detail, starred = false) {
    const created = (() => {
        const date = new Date();
        return date.setTime(date.getTime());
    })();
    try {
        const req = uniqid();
        const encrypttask = CryptoJS.AES.encrypt(task, req).toString();
        const encryptdetail = CryptoJS.AES.encrypt(detail, req).toString();
        const data = await setDoc(doc(db, tables.tasks, req), {
            uid: user.uid,
            list,
            task: encrypttask,
            detail: encryptdetail,
            starred,
            deleted: false,
            created,
            updated: created,
        });
        return {
            type: "success",
            action: "add-list",
            data: data
        };
    } catch (err) {
        console.error(err);
        return clarifyError(err);
    }
}

async function updateTask(task, updates = {}) {
    const timestamp = (() => {
        const date = new Date();
        return date.setTime(date.getTime());
    })();
    try {
        updates.updated = timestamp;
        if (updates.task) updates.task = CryptoJS.AES.encrypt(updates.task, task).toString();
        if (updates.detail) updates.detail = CryptoJS.AES.encrypt(updates.detail, task).toString();
        await updateDoc(doc(db, tables.tasks, task), updates);
        return {
            type: "success",
            action: "update-task",
            data: ""
        }
    } catch (err) {
        console.error(err);
        return clarifyError(err);
    }
}

async function getAllLists(user) {
    try {
        const q = query(collection(db, tables.lists), where('uid', "==" , user.uid), where('deleted', "==", false));
        const snap = await getDocs(q);
        const result = [
            {
                label: <i className="fas fa-star"></i>,
                key: "starred",
            },
            {
                label: 'My tasks',
                key: "default",
            }
        ];
        snap.docs.sort((a, b) => a.data().created - b.data().created).forEach(item => result.push({ label: CryptoJS.AES.decrypt(item.data().label, item.id).toString(CryptoJS.enc.Utf8), key: item.id}));
        return {
            type: "success",
            action: "get-lists",
            data: result
        };
    } catch (err) {
        console.error(err);
        return clarifyError(err);
    }
}

async function getAllTasks(user, docs) {
    try {
        const q = query(collection(db, tables.tasks), where("uid" , "==", user.uid), where("deleted", "==", false));
        const snap = await getDocs(q);
        const result = {
            "$allTasks": {},
        };
        for (const key of docs) (result[key.key] = []) && (result[key.key].completed = []);
        snap.docs.sort((a, b) => a.data().created - b.data().created).reverse().forEach(item => {
            const data = { ...item.data(), id: item.id };
            data.task = CryptoJS.AES.decrypt(data.task, data.id).toString(CryptoJS.enc.Utf8);
            data.detail = CryptoJS.AES.decrypt(data.detail, data.id).toString(CryptoJS.enc.Utf8);
            if (data.starred) (data.checked ? result.starred?.completed?.push(data) : result.starred?.push(data));
            if (data.checked) result[data.list]?.completed?.push(data); else result[data.list]?.push(data);
            result.$allTasks[item.id] = data;
        });
        return {
            type: "success",
            action: "get-lists",
            data: result
        };
    } catch (err) {
        console.error(err);
        return clarifyError(err);
    }
}

export {
    addNewList,
    addNewTask,
    updateList,
    updateTask,
    getAllLists,
    getAllTasks,
};