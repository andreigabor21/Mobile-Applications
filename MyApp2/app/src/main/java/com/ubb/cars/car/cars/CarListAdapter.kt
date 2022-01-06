package com.ilazar.myapp2.todo.cars

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.ilazar.myapp2.todo.car.CarEditFragment
import com.ubb.cars.R
import com.ubb.cars.core.TAG
import com.ubb.cars.car.data.Car

class CarListAdapter(
    private val fragment: Fragment,
) : RecyclerView.Adapter<CarListAdapter.ViewHolder>() {

    var cars = emptyList<Car>()
        set(value) {
            field = value
            notifyDataSetChanged();
        }

    private var onCarClick: View.OnClickListener = View.OnClickListener { view ->
        val car = view.tag as Car
        fragment.findNavController().navigate(R.id.CarEditFragment, Bundle().apply {
            putString(CarEditFragment.INDIVIDUAL_ID, car._id)
        })
    };

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.view_car, parent, false)
        Log.v(TAG, "onCreateViewHolder")
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        Log.v(TAG, "onBindViewHolder $position")
        val car = cars[position]
        holder.textView.text = car.text
        holder.itemView.tag = car
        holder.itemView.setOnClickListener(onCarClick)
    }

    override fun getItemCount() = cars.size

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textView: TextView

        init {
            textView = view.findViewById(R.id.text)
        }
    }
}
