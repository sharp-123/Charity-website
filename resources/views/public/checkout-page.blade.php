@extends('layouts.master')

@section('content')
<section class="bg-02-a">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="_head_01">
                    
                </div>
            </div>
        </div>
    </div>
</section>
<section>
    <div class="container">
        <div class="my-4 p-3 card-header"><h4 class="m-0">Donating Page</h4></div>
        <div class="row">
            <div class="col-lg-12">
                <div class="cart-product card-header">
                    <h4><a href="#" title="Back to cart" class="text-danger"><i class="fas fa-shopping-basket" ></i></a> {{$selected_aspect->title}}</h4>
                    <br>
                    <h5>Description:</h5> 
                    <p>{{$selected_aspect->description}}</p>
                    <div class="row">
                        <div class="col-lg-6 col-md-6 mb-4">
                            <img width="100%" src="{{$selected_aspect->image_url}}">
                        </div>
                        <div class="col-lg-6 col-md-6 mb-4">
                            <video width="100%" height="100%" controls>
                                @if($selected_aspect->video_id != null)
                                <source src="{{ route('getVideo', $selected_aspect->video_id)  }}" type="video/mp4">
                                @endif
                            </video>
                        </div>
                    </div>
                </div>
                <div class="billing-address my-4">
                    <div class="p-3 my-4" style="text-align:center;"><h4 class="m-0">Donation</h4></div>

                    <form action="{{route('cart.proceed', $selected_aspect->id)}}" method="post">
                        @csrf
                        <div class="form-group">
                            <input type="number" name="donation_amount" class="form-control {{$errors->has('donation_amount')? 'is-invalid' : ''}}" placeholder="Donation Amount">
                            
                            @if($errors->has('donation_amount'))
                                <span class="invalid-feedback"><strong>{{$errors->first('donation_amount')}}</strong></span>
                            @endif
                        </div>
                        <div class="form-group">
                            <input type="text" name="shipping_name" class="form-control {{$errors->has('shipping_name')? 'is-invalid' : ''}}" value="{{Auth::user()? Auth::user()->name : ''}}" placeholder="{{ __('Name') }}">

                            @if($errors->has('shipping_name'))
                                <span class="invalid-feedback"><strong>{{$errors->first('shipping_name')}}</strong></span>
                            @endif
                        </div>
                        <div class="form-group">
                            <input type="text" name="mobile_no" class="form-control {{$errors->has('mobile_no') ? 'is-invalid': ''}}" placeholder="{{ __('Mobile number') }}">

                            @if($errors->has('mobile_no'))
                                <span class="invalid-feedback">
                                    <strong>{{$errors->first('mobile_no')}}</strong>
                                </span>
                            @endif
                        </div>
                        <div class="form-group">
                            <textarea name="address" class="form-control {{$errors->has('address')? 'is-invalid' : ''}}" placeholder="{{ __('Shipping Address') }}" cols="30" rows="5"></textarea>
                            @if($errors->has('address'))
                                <span class="invalid-feedback">
                                    <strong>{{$errors->first('address')}}</strong>
                                </span>
                            @endif
                        </div>

                        <div class="payment-area my-4 py-5 px-3" style="text-align:center;">
                            <input type="submit" value="{{ __('Proceed to payment') }}" class="btn btn-primary">
                        </div>
                    </form>
                </div>
            </div>
            
        </div>
    </div>
</section>
@endsection
