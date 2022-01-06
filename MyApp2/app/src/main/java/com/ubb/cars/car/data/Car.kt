package com.ubb.cars.car.data

data class Car(
    var _id: String,
    var text: String
) {
    override fun toString(): String = text
}
