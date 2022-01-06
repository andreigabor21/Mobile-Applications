package com.ubb.cars.car.data.remote

import com.ubb.cars.core.Api
import com.ubb.cars.car.data.Car
import retrofit2.http.*

object CarApi {
    interface Service {
        @GET("/api/car")
        suspend fun find(): List<Car>

        @GET("/api/car/{id}")
        suspend fun read(@Path("id") itemId: String): Car;

        @Headers("Content-Type: application/json")
        @POST("/api/car")
        suspend fun create(@Body car: Car): Car

        @Headers("Content-Type: application/json")
        @PUT("/api/car/{id}")
        suspend fun update(@Path("id") itemId: String, @Body car: Car): Car
    }

    val service: Service = Api.retrofit.create(Service::class.java)
}