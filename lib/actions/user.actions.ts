"use server"

import User from "../models/user.model";
import Community from "../models/community.thread";
import Thread from "../models/thread.model";
import { connectDB } from "../mongoose";

import { revalidatePath } from "next/cache";
import { FilterQuery, SortOrder } from "mongoose";

export async function fetchUser(userId: string){
    try {
        await connectDB();
        return await User.findOne({id : userId}).populate({
            path: "communities",
            model: Community,
        })
    } catch (error : any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

interface Params{
    userId: string,
    username: string,
    name: string,
    image: string,
    bio: string,
    path: string,
}

export async function updateUser({userId, username, name, image, bio, path} : Params) : Promise<void> {
    try {
        await connectDB();

        await User.findOneAndUpdate(
            { id: userId},
            { 
                username: username.toLowerCase(),
                name, 
                bio,
                image,
                onBoarded: true,
            },
            { upsert: true }
        );

        if(path == "/profile/edit"){
            revalidatePath(path);
        }
    } catch (error : any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string){
    try {
        await connectDB();
        const threads = await User.findOne({id:userId}).populate({
            path: "threads",
            model: Thread,
            populate: [
                {
                    path: "community",
                    model: Community,
                    select: "name id image _id",
                },
                {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: "author",
                        model: User,
                        select: "name image id",
                    }
                }
            ]
        })
        return threads;
    } catch (error) {
        console.error("Error fetching user threads: ", error);
        throw error;
    }
}

export async function fetchUsers({
    userId,
    searchString="",
    pageNumber=1,
    pageSize=20,
    sortBy="desc",
} : {
    userId: string,
    searchString?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: SortOrder,
}) {
    try {
        await connectDB();
        
        //calculate the number of users to skip based on the page number and page size
        const skipAmount = (pageNumber - 1)*pageSize;

        //create a case-insensitive regular expression for the provided search string
        const regex = new RegExp(searchString, "i");

        //Create a intitive query object to fillter users.
        const query : FilterQuery<typeof User> = {
            id: {$ne : userId}, //Exclude the current user from the results.
        };

        //if the search string is not empty, add the $or operator to match either username or name fields.
        if(searchString.trim() !== ""){
            query.$or = [
                {username : {$regex : regex}},
                {name : {$name : regex}},
            ];
        }

        //define the sort options for the fetched users based on createdAr field and provided sort order.
        const sortOptions = {createdAt : sortBy};
        const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);

        //count the total number of users that match the search criteria (without pagination).
        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        //check if there are more users beyond the current page.
        const isNext = totalUsersCount > skipAmount + users.length;
        return {users, isNext};
    } catch (error) {
        console.error("Error fetching users: ", error);
        throw error;
    }
}

export async function getActivity(userId : string){
    try {
        await connectDB();

        //find all threads created by the user
        const userThreads = await Thread.find({author: userId});

        //collect all the child thread ids (replies) from the 'children' field of each user thread
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        }, []);

        //find and return the child threads (replies) excluding the one created by the same user
        const replies = await Thread.find({
            _id: {$in: childThreadIds},
            author: {$ne: userId}
        }).populate({
            path: 'author',
            model: User,
            select: "name image _id",
        });

        return replies;
    } catch (error) {
        console.error("Error fetching replies: ", error);
        throw error;
    }
}