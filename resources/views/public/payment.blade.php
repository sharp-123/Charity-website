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
    <div class="container">
        <div class="payment-area">
            <h4 class="my-4 blue-dark p-3">{{ __('Make your payment') }}</h4>

            <div class="cart-summary my-3">
                <div class="card">
                    <div class="card-header">
                        <h4>Donation Summary</h4>
                    </div>
                    <div class="card-body">
                        <h4><strong>{{ __('Total cost') }} : ${{$cost}}</strong></h4>
                    </div>
                </div>
            </div>
            
            <div class="bg-light p-3 my-4" style="display: flex;">
                <form action="{{route('cart.checkout')}}" method="post">
                    @csrf
                    <input type="hidden" name="cart_total" value="{{$cost}}">
                    <script src="https://checkout.stripe.com/checkout.js" class="stripe-button"
                            data-key="{{ env('STRIPE_PUB_KEY') }}"
                            data-name="Donation"
                            data-description="Online course about integrating Stripe"
                            data-locale="auto"
                            data-currency="usd">
                    </script>
                </form>
                <a href="{{ route('payment', $cost) }}" class="btn btn-success btn-sm" style="margin-left: 10px;"><strong>Pay from Paypal</strong></a>
            </div>
        </div>
    </div>
@endsection
