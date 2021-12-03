package com.ilazar.myapp2.todo.data

data class Car(
    var _id: String,
    var text: String
) {
    override fun toString(): String = text
}
