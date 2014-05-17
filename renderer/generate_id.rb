#!/usr/bin/env ruby

o = [('A'..'Z'), ('0'..'9')].map { |i| i.to_a }.flatten
string = (0...16).map { o[rand(o.length)] }.join
puts string
